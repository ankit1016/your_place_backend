const express=require('express')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const fs=require('fs')
const path=require('path')

const placesRoutes=require('./routes/places-route');
const userRoutes=require('./routes/user-route')
const HttpError = require('./models/http-error');


// Extends the express app with a new app.
const app=express();
// Define a route for the homepage
app.get('/', (req, res) => {
    res.send('Welcome to application');
  });
  
  // Define a route for a custom message
  app.get('/message', (req, res) => {
    res.send('you are on message route thanks for visiting');
  });


// Returns true if the request was successful.
app.use('/uploads/images',express.static(path.join('uploads','images')))

// parse application/json
app.use(bodyParser.json())

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authrization,Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
    
    next();
})


// Setup the places routes..
app.use('/api/places',placesRoutes)

// Setup the user routes.
app.use('/user',userRoutes)


// throw the error if route is not found
app.use((req,res,next)=>{
    const err=new HttpError('could not find thid route',404)
    throw err
})

// Send an error to the client.
app.use((error,req,res,next)=>{
if(req.file){
    fs.unlink(req.file.path,(err)=>{console.log(err)})
}
if(res.headerSent){
    return next(error)
}
res.status(error.code||500);
res.json({message:error.message||'An unknown error occurred!'})
})


// Starts the server on the specified port
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cfcau.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`).then(()=>{
        console.log('database connected successfully')
       app.listen(process.env.PORT||5001,(err)=>{
        if(err)
        console.log(err)
        else
        console.log('server running on port 5000')
       })
}).catch(err=>console.log(err))

