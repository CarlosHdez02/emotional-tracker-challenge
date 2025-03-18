import express from "express";
import UserController from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

export default class UserRoutes {
  router = express.Router();
  userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Public routes
    this.router.post("/register", this.userController.registerUser.bind(this.userController));
    this.router.post("/login", this.userController.loginUser.bind(this.userController));
   
    
    // Password reset routes (public)
    //this.router.post("/forgot-password", this.userController.requestPasswordReset.bind(this.userController));
    this.router.get('/',protect,this.userController.getUsers.bind(this.userController))
    this.router.patch("/change-password/:userId", protect, this.userController.updatePassword.bind(this.userController))
    
    // Protected routes
    this.router.get("/profile/:id", protect, this.userController.getUserProfile.bind(this.userController));
    this.router.put("/profile/:id", protect, this.userController.updateUser.bind(this.userController));
  }

  getRouter() {
    return this.router;
  }
}