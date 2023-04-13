
const express=require('express');
const placeController=require('../controllers/places-controller')
const fileUpload=require('../middleware/file-upload') 
const checkAuth=require('../middleware/check-auth')
const router=express.Router();
 



// get all places from places
router.get('/',placeController.getPlace)

// get the specific places based on id
router.get('/:pid',placeController.getPlacedById)

// middleware to check the token is present or not  
router.use(checkAuth);

// get places based on a user id
router.get('/user/:uid',placeController.getPlacedByUserId) 

// Post or add the places
router.post('/',fileUpload.single('image'),placeController.createPlace)

//Update the places based on id.
router.patch('/:pid',placeController.updatePlace)

// Delete the places based on id.
router.delete('/:pid',placeController.deletePlace)


module.exports=router