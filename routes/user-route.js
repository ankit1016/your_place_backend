const express =require('express')
const router=express.Router()

const userController=require('../controllers/user-controller')
const fileUpload=require('../middleware/file-upload')
 router.get('/',userController.getUser)
 router.post('/signup',fileUpload.single('image'),userController.signup)
 router.post('/login',userController.login)

 module.exports=router