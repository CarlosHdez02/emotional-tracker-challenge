import express from "express";
import EmotionController from '../controllers/EmotionController.js';
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/errorMiddleware.js";
import { emotionCreateSchema, emotionUpdateSchema } from "../schemas/emotionSchema.js";

export default class EmotionRouter {
  constructor() {
    this.router = express.Router();
    this.emotionController = new EmotionController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Root routes
    this.router.route("/").get(protect, (req, res, next) => this.emotionController.getUserEmotions(req, res, next))

    this.router.route.post('/', protect,validate(emotionCreateSchema),(req,res,next)=>this.emotionController.createEmotion(req,res,next))
     
    // Summary routes - need to be before /:emotionId to avoid route parameter conflict
    this.router.get("/summary", protect, (req, res, next) => this.emotionController.getEmotionSummary(req, res, next));
    
    this.router.get("/summary/:userId", protect, (req, res, next) => this.emotionController.getEmotionSummary(req, res, next));
    
    // Individual emotion routes
    this.router.get("/:emotionId", protect, (req, res, next) => this.emotionController.getEmotionById(req, res, next));
    
    this.router.put("/:emotionId",protect,validate(emotionUpdateSchema),(req, res, next) => this.emotionController.updateEmotion(req, res, next));
    
    this.router.delete("/:emotionId", protect, (req, res, next) => this.emotionController.deleteEmotion(req, res, next));
    
    // Future addition: Routes for sharing data with therapists
  }

  getRouter() {
    return this.router;
  }
}