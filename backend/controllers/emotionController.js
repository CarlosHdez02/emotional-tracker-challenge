import EmotionService from "../services/emotionService.js";
import { ValidationError, NotFoundError } from "../middlewares/errorMiddleware.js";
import { emotionCreateSchema, emotionUpdateSchema } from "../schemas/emotionSchema.js";

export default class EmotionController {
  emotionService = new EmotionService();

  // Get all emotions for a user
  async getUserEmotions(req, res, next) {
    try {
      const userId = req.params.userId || req.user._id;
      const emotions = await this.emotionService.getUserEmotions({ user: userId });
      
      res.status(200).json({
        success: true,
        count: emotions.length,
        data: emotions
      });
    } catch (err) {
      next(err);
    }
  }

  // Get a specific emotion by ID
  async getEmotionById(req, res, next) {
    try {
      const { emotionId } = req.params;
      const emotion = await this.emotionService.getEmotionById(emotionId);
      
      res.status(200).json({
        success: true,
        data: emotion
      });
    } catch (err) {
      next(err);
    }
  }

  // Create a new emotion
  async createEmotion(req, res, next) {
    try {
      // Validate the request body
      const { error } = emotionCreateSchema.validate(req.body);
      if (error) {
        const errorDetails = error.details.map(detail => detail.message);
        throw new ValidationError('Validation failed', 400, errorDetails);
      }

      // Add user ID to emotion data
      const emotionData = {
        ...req.body,
        user: req.user._id
      };
      
      const newEmotion = await this.emotionService.createEmotion(emotionData);
      
      res.status(201).json({
        success: true,
        data: newEmotion
      });
    } catch (err) {
      next(err);
    }
  }


  async updateEmotion(req, res, next) {
    try {
      const { emotionId } = req.params;
      
      // Validate the request body
      const { error } = emotionUpdateSchema.validate(req.body);
      if (error) {
        const errorDetails = error.details.map(detail => detail.message);
        throw new ValidationError('Validation failed', 400, errorDetails);
      }
      
      const updatedEmotion = await this.emotionService.updateEmotion(emotionId, req.body);
      
      res.status(200).json({
        success: true,
        data: updatedEmotion
      });
    } catch (err) {
      next(err);
    }
  }

  // Get emotion summary for a user
  async getEmotionSummary(req, res, next) {
    try {
      const userId = req.params.userId || req.user._id;
      const summary = await this.emotionService.getEmotionSummary(userId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  }
}