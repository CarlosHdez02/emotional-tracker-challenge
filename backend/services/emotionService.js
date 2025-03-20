import { NotFoundError, ValidationError } from "../middlewares/errorMiddleware.js";
import Emotion from "../models/emotionModel.js";
import mongoose from "mongoose";

export default class EmotionService {
  async getUserEmotions(query) {
    try {

      const emotions = await Emotion.find(query);
      return emotions;
    } catch (err) {
      console.error("Error fetching user emotions:", err);
      throw err;
    }
  }

  async getEmotionById(emotionId) {
    try {
      const emotion = await Emotion.findById(emotionId);
      if (!emotion) {
        throw new NotFoundError("Emotion not found");
      }
      return emotion;
    } catch (err) {
      throw err;
    }
  }
  async createEmotion(emotionData) {
    try {
      const newEmotion = await Emotion.create(emotionData);
      return newEmotion;
    } catch (err) {
      console.error("Error creating emotion:", err);
      
  
      if (err.name === 'ValidationError') {
        throw new ValidationError(err.message);
      }
      throw err;
    }
  }

  async updateEmotion(emotionId, emotionData) {
    try {
      const emotionRecord = await Emotion.findById(emotionId);
      
      if (!emotionRecord) {
        throw new NotFoundError("There is no emotion with that id in database");
      }
      
      Object.assign(emotionRecord, emotionData);
      const updatedEmotion = await emotionRecord.save();
      return updatedEmotion;
    } catch (err) {
      console.error("Error updating emotion:", err);
      throw err;
    }
  }

  async deleteEmotion(emotionId) {
    try {
      const deletedEmotion = await Emotion.findByIdAndDelete(emotionId);
      
      if (!deletedEmotion) {
        throw new NotFoundError('Emotion not found');
      }
      
      return deletedEmotion;
    } catch (err) {
      console.error("Error deleting emotion:", err);
      
      if (err.name === 'CastError') {
        throw new ValidationError('Invalid emotion ID format');
      }
      
      throw err;
    }
  }


  async getEmotionSummary(userId) {
    try {
      const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
    
      
      const aggregationResult = await Emotion.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalIntensity: { $sum: "$intensity" },
            emotions: { $push: "$emotion" },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            averageIntensity: {
              $cond: [
                { $eq: ["$count", 0] },
                0,
                { $divide: ["$totalIntensity", "$count"] },
              ],
            },
            emotions: 1,
          },
        },
      ]);
      
      const emotionCounts = {};
      
      if (aggregationResult.length > 0 && aggregationResult[0].emotions) {
        aggregationResult[0].emotions.forEach((emotion) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
        delete aggregationResult[0].emotions;
      }
      
      const summary = aggregationResult.length > 0
        ? { ...aggregationResult[0], emotionCounts }
        : { count: 0, averageIntensity: 0, emotionCounts: {} };
      
      return summary;
    } catch (err) {
      console.error("Error generating emotion summary:", err);
      throw err;
    }
  }
}