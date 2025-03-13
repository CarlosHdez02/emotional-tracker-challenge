import { NotFoundError, ValidationError } from "../middlewares/errorMiddleware.js";
import Emotion from "../models/emotionModel.js";

export default class EmotionService {
  async getUserEmotions(userId) {
    try {
      const emotions = await Emotion.find(userId);
      return emotions;
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  }
  async createEmotion(emotionData) {
    try {
      const existingEmotion = await Emotion.findOne({emoion: emotionData.emotion})
      if(existingEmotion) throw new ValidationError("An emotion with that name is already registered")
      const newEmotion = await Emotion.create(emotionData);
      return newEmotion;
    } catch (err) {
      console.error(err);
    }
  }

  async updateEmotion(emotionId, emotionData) {
    const emotionRecord = await Emotion.findById(emotionId);

    if (!emotionRecord) {
      throw new NotFoundError("There is no emotion with that id in database");
    }
    Object.assign(emotionRecord, emotionData);

    const updatedEmotion = await emotionRecord.save();

    return updatedEmotion;
  }
  async getEmotionSummary(userId) {
    try {
      const aggregationResult = await Emotion.aggregate([
        { $match: { user: userId } },

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

      const summary =
        aggregationResult.length > 0
          ? { ...aggregationResult[0], emotionCounts }
          : { count: 0, averageIntensity: 0, emotionCounts: {} };

      return summary;
    } catch (err) {
      console.error("Error generating emotion summary:", err);
      throw err;
    }
  }
}
