const express=require('express')
const router=express.Router() // Router express ka part hai
const {home, dummy}=require('../controllers/homeController')
const {signUp}=require('../controllers/userController')

router.route('/').get(home);
router.route('/dummy').get(dummy); 

module.exports=router