import EmotionService from "../services/emotionService.js";
import {
  ValidationError,
  NotFoundError,
} from "../middlewares/errorMiddleware.js";
import {
  emotionCreateSchema,
  emotionUpdateSchema,
} from "../schemas/emotionSchema.js";

export default class EmotionController {
  constructor() {
    this.emotionService = new EmotionService();
  }

  async getUserEmotions(req, res, next) {
    try {
      const userId = req.params.userId || req.user._id;

      const emotions = await this.emotionService.getUserEmotions({
        user: userId,
      });

      res.status(200).json({
        success: true,
        count: emotions.length,
        data: emotions,
      });
    } catch (err) {
      next(err);
    }
  }

  async getEmotionById(req, res, next) {
    try {
      const emotionId = req.params.emotionId;

      const emotion = await this.emotionService.getEmotionById(emotionId);

      res.status(200).json({
        success: true,
        data: emotion,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteEmotion(req, res, next) {
    try {
      const emotionId = req.params.emotionId;
      
      const emotion = await this.emotionService.getEmotionById(emotionId);
      
      if (!emotion) {
        return res.status(404).json({
          success: false,
          message: 'Emotion not found'
        });
      }
      
      // Delete the emotion
      await this.emotionService.deleteEmotion(emotionId);
      
      res.status(204).json({
        success: true,
        message: 'Emotion deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async createEmotion(req, res, next) {
    try {
      const { error, value } = emotionCreateSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        throw new ValidationError(
          error.details.map((err) => err.message).join(", ")
        );
      }

      const emotionData = {
        ...value,
        user: req.user._id,
      };

      const newEmotion = await this.emotionService.createEmotion(emotionData);

      return res.status(201).json({
        success: true,
        data: newEmotion,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEmotion(req, res, next) {
    try {
      const { emotionId } = req.params;

      const { error, value } = emotionUpdateSchema.validate(req.body);
      if (error) {
        const errorDetails = error.details.map((detail) => detail.message);
        throw new ValidationError("Validation failed", 400, errorDetails);
      }

      const updatedEmotion = await this.emotionService.updateEmotion(
        emotionId,
        value
      );

      res.status(200).json({
        success: true,
        data: updatedEmotion,
      });
    } catch (err) {
      next(err);
    }
  }

  async getEmotionSummary(req, res, next) {
    try {
      const userId = req.params.userId || req.user._id;
      const summary = await this.emotionService.getEmotionSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }
}
