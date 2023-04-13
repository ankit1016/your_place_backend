const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken')


module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    // console.log(req.headers.authorization)
    // Authenticates a user using a JWT.
    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            const err = new HttpError('Authentication failed', 401)
            return next(err)
        }
        // console.log("runing..........................");

        const decodedToken = jwt.verify(token, process.env.JWT_KEY)
        // console.log(decodedToken);
        req.userData = { userId: decodedToken.userId }
        next()
    } catch (error) {
        // console.log(error)
        const err = new HttpError('Authentication failed', 401)
        return next(err)
    }
}