import mongoose from "mongoose"

export class DatabaseConnect{

    handleInitDb(){
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/emotionaltracker'
        try{
            mongoose.connect(MONGO_URI,{
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
        }catch(err){
            console.error("MongoDB connection error: ",err)
        }
    }
}