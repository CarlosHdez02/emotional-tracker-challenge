import express from "express";
import TherapistController from "../controllers/therapistController.js";
import { protect } from "../middlewares/authMiddleware.js";

export default class TherapistRoute {
  router = express.Router();
  therapistController = new TherapistController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Assign a therapist to a user
    this.router.post(
      "/assign",
      protect,
      this.therapistController.assignTherapist.bind(this.therapistController)
    );
    
    // Remove therapist from user - fixed to not use userId param
    this.router.delete(
      "/remove", 
      protect, 
      this.therapistController.removeTherapist.bind(this.therapistController)
    );
    
    // Share emotions with therapist
    this.router.post(
      "/share-emotions", 
      protect, 
      this.therapistController.shareEmotions.bind(this.therapistController)
    );
    
    // Get therapist details
    this.router.get(
      "/:therapistId", 
      protect, 
      this.therapistController.getTherapistDetails.bind(this.therapistController)
    );
  


   
  }
  getRouter() {
    return this.router;
  }
}