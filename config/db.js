const mongoose=require('mongoose')

const connectwithDb=async()=>{
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log(`DB is Connected`)
    } catch (error) {
        console.log(`DB connection Failed`);
        console.log(error)
        process.exit(1)
    }
}

module.exports=connectwithDb;