//  const uuid=require('uuid')
const User = require('../models/user')
const HttpError = require('../models/http-error')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Returns a dummy user
const getUser = async (req, res, next) => {
   //  res.json({user:dummy_user})
   // for exclude the password from user object and rest is send as response and for specfic field {},"email name"
   let users
   try {
      users = await User.find({}, '-password')
   } catch (error) {
      const err = new HttpError(error.message, 500);
      return next(err)
   }

   res.json({ users: users.map((data) => data.toObject({ getters: true })) })

}


// Signup a user successfully
const signup = async (req, res, next) => {
   const body = req.body
   //  console.log(body.email)
   let existingUser
   // Sign up a new user.
   try {
      existingUser = await User.findOne({ email: body.email })
   } catch (error) {
      const err = new HttpError(error.message, 500)
      return next(err)
   }

   // Checks if a user already exists
   if (existingUser) {
      const err = new HttpError('user already exist', 422)
      return next(err)
   }

   let hasedPassword;

   // hash the user Password.
   try {
      hasedPassword = await bcrypt.hash(body.password, 12)
   } catch (error) {
      const err = new HttpError('Could not create user,Please try again')
      return next(err)
   }

   const user = new User({ ...req.body, image: req?.file?.path, password: hasedPassword })
   // console.log(user, existingUser, hasedPassword)
   // Attempt to save the user.
   try {
      await user.save()
   } catch (error) {
      const err = new HttpError(error.message, 500)
      return next(err)
   }
   let token;
   try {
      token = jwt.sign({ userId: user.id, email: user.email }, `${process.env.JWT_KEY}`, { expiresIn: '180d' })
   } catch (error) {
      const err = new HttpError('Signing up failed, please try again later.')
      return next(err)
   }


   // Returns true if the request was successful.
   res.status(201).json({ userId: user.id, email: user.email, token: token })

}


// Attempts to login a user
const login = async (req, res, next) => {
   // console.log(req.body)
   const { email, password } = req.body;

   let existingUser
   // Sign up a new user.
   try {
      existingUser = await User.findOne({ email: email })
   } catch (error) {
      const err = new HttpError(error.message, 500)
      return next(err)
   }
   //  console.log(existingUser)
   if (!existingUser) {
      return res.status(500).json({ message: 'user not register' })
   }
   let isValidPassword = false;

   try {
      isValidPassword = await bcrypt.compare(password, existingUser.password)
   } catch (error) {
      const err = new HttpError('could not login please check your cerdentials and try again', 500)
      return next(err)
   }
   if (!isValidPassword) {
      const err = new HttpError('Invalid credentials, could not log you in', 401)
      return next(err)
   }

   let token;
   try {
      token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, `${process.env.JWT_KEY}`, { expiresIn: '1h' })
   } catch (error) {
      const err = new HttpError('Signing up failed, please try again later.')
      return next(err)
   }

   res.status(201).json({ userId: existingUser.id, email: existingUser.email, token: token })

}

// Set the user signup and login fields.
exports.getUser = getUser
exports.signup = signup
exports.login = login