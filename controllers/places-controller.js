const { mongoose } = require('mongoose')
const HttpError = require('../models/http-error')
const fs = require('fs')
const Place = require('../models/place')

const User = require("../models/user")

const getPlace = async (req, res, next) => {
  let places = await Place.find()
  //   console.log(places)
  res.json({ places: places.map(place => place.toObject({ getters: true })) })
}

// get the specific places based on id
const getPlacedById = async (req, res, next) => {
  const placeId = req.params.pid

  //find by id is static method here if you want to promise then use findById().exec() or you can use async and await fuction with try and catch
  let place;
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(err.message, 500)
    return next(error)
  }

  if (!place) {
    const error = new HttpError('no place found', 500)
    return next(error)
  }

  // toObject is used for covert the data and getters covert the _id into normal id 
  res.json({ place: place.toObject({ getters: true }) })


}

// getPlacedByUserId returns the places based on the provided user id
const getPlacedByUserId = async (req, res, next) => {
  const userId = req.params.uid
  // console.log('return the places based on user id')
  // const place=DUMMY_PLACES.find(p=>p.creator===userId)
  let places
  try {
    places = await Place.find({ creator: userId })
  } catch (err) {
    const error = new HttpError('in fetching place some error try later', 500)
    return next(error)
  }

  if (!places || places.length === 0) {

    // let error=new Error('could not find a place for the provided user id.');
    // error.code=404
    const error = new HttpError('could not find a place for the provided user id.', 404)
    return next(error)

  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) })
}


// Create a place.
const createPlace = async (req, res, next) => {

  // console.log(body)

  let user;
  try {
    user = await User.findById(req.userData.userId)
  } catch (error) {
    const err = new HttpError(error.message)
    return next(err)
  }
  // console.log(user)
  if (!user) {
    const err = new HttpError('Could not find user for provided id', 404)
    return next(err)
  }
  const createPlace = new Place({ ...req.body, image: req.file.path, creator: req.userData.userId })
  // console.log(createPlace)
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save({ session: sess })
    user.places.push(createPlace);
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (error) {
    const err = new HttpError(error.message, 500)
    return next(err)
  }
  res.json({ place: createPlace.toObject({ getters: true }) })
  //  createPlace.save().then((r)=>{
  //     res.status(201).json({message:'Place add Successfully',place:r})
  //  }).catch(err=> res.status(404).json({message:err.message}))
}


// Update a place based on id.
const updatePlace = async (req, res, next) => {
  // console.log(req)
  const body = req.body
  const id = req.params.pid
  // console.log(body, id)
  // res.json({message:'updated successfully'})

  let place;
  try {
    place = await Place.findById(id)
  } catch (error) {
    const err = new HttpError('something wrong', 500)
    return next(err)
  }
  if (!Place) {
    const err = new HttpError('no place found', 404)
    return next(err)
  }


  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place', 401)
    return next(error)
  }

  try {
    place.title = body.title,
      place.description = body.description
    place.save()
  } catch (error) {
    const err = new HttpError('something wrong', 500)
    return next(err)
  }

  res.json({ place: place.toObject({ getters: true }) })

}

// Delete a place based on id
const deletePlace = async (req, res, next) => {
  const id = req.params.pid
  // console.log(id)
  //populate allow us to take the document ref to another colection 
  let place;
  try {
    place = await Place.findById(id).populate('creator')
  } catch (error) {
    const err = new HttpError('something wrong')
    return next(err)
  }
  if (!place) {
    const error = new HttpError('Could not find place for this id', 404)
    return next(error)
  }

  // console.log("place", place.creator.id, "user object", req.userData)
  if (place.creator.id.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to delete this place', 401)
    return next(error)
  }

  const imagePath = place.image
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess })
    place.creator.places.pull(place)
    await place.creator.save({ session: sess })
    await sess.commitTransaction()
  } catch (error) {
    const err = new HttpError('something wrong, could not delete the place.')
    return next(err)
  }
  fs.unlink(imagePath, err => { console.log(err) })

  res.json({ message: 'deleted successfully' })
}


exports.getPlace = getPlace
exports.getPlacedById = getPlacedById
exports.getPlacedByUserId = getPlacedByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
