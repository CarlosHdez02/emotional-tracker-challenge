import EmotionService from "./emotionService.js";
import Emotion from "../models/emotionModel.js";

export default class IdentifyPatternClass{

    async getTheMostEmotions(query){
        try{
            const emotions = await Emotion.find(query)
            if(!emotions) return []
            return emotions
        }catch(err){
            console.error(err,"err at getEmotionsService")
        }
    }
}