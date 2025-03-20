import IdentifyPatternClass from "../services/identifyPatternsService.js"


export default class IdentifyPatternController{


    identifyService = new IdentifyPatternClass()
    async getPattenrs(req,res,next){
        try{
            const user = req.user._id || req.user.id  //to get current user
            //  comparing with mongo
            const emotions = await this.identifyService.getTheMostEmotions({
                user:user,
                intensity: {$gt:2}  
            })
            console.log(emotions)
            return res.status(200).json({
                success:true,
                data:emotions
            })

        }catch(err){

        }
    }
}