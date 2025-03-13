import express from "express";
import EmotionController from '../controllers/EmotionController.js';
import { protect } from "../middlewares/authMiddleware.js";
export default class EmotionRoutes {
  router = express.Router();
  emotionController = new EmotionController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    
    this.router.get("/summary/:userId", protect, this.emotionController.getEmotionSummary.bind(this.emotionController));
    
    this.router.post("/", protect, this.emotionController.createEmotion.bind(this.emotionController));
    

    this.router.get("/user/:userId", protect, this.emotionController.getUserEmotions.bind(this.emotionController));
    this.router.get("/emotion/:emotionId", protect, this.emotionController.getEmotionById.bind(this.emotionController));
    this.router.put("/:emotionId", protect, this.emotionController.updateEmotion.bind(this.emotionController));
  }

  getRouter() {
    return this.router;
  }
}