const express=require('express')
const morgan=require('morgan')
require('dotenv').config()
const app=express()
const cookieParser=require('cookie-parser')
const fileUpload=require('express-fileupload')


//regular middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//cookies and file middleware
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))

app.set("view engine","ejs")
//import all routes here
const home=require('./routes/home')
const user=require('./routes/user')
const product=require('./routes/product')
//middleware for morgan
app.use(morgan('tiny'))

//router for middleware
app.use('/api/v1/',home)
app.use('/api/v1/', user)
app.use('/api/v1/',product)

//test for file-part
app.get('/signUpPost',(req,res)=>{
    res.render('signUpPost')
})


//export app js
module.exports=app