exports.home=async(req,res)=>{
    try {
        //const db=await something()
        res.status(200).send({
            success:true,
            greeting:"hello from API"
        })
    } catch (error) {
        console.log(error)
    }
}

exports.dummy=async(req,res)=>{
    try {
        //const db=await something() 
        res.status(200).send({
            success:true,
            greeting:"hello from dummyAPI"
        })
    } catch (error) {
        console.log(error)
    }
}
