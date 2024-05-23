const app=require('./app')
const connectwithDb=require('./config/db')
require('dotenv').config()
const cloudinary=require('cloudinary').v2
//connect ot db
connectwithDb();

cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT} `)
})
