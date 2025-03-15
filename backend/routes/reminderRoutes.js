import express from "express";
import ReminderController from "../controllers/reminderController.js";
import { protect } from "../middlewares/authMiddleware.js";

export default class ReminderRoute {
 router = express.Router();
 reminderController = new ReminderController();

 constructor() {
   this.initializeRoutes();
 }

 initializeRoutes() {
   // Get all reminders for logged in user
   this.router.get("/", protect, this.reminderController.getReminders.bind(this.reminderController));
   
   // Create a new reminder
   this.router.post("/", protect, this.reminderController.createReminder.bind(this.reminderController));
   
   // Get a specific reminder by ID
   this.router.get("/:id", protect, this.reminderController.getReminderById.bind(this.reminderController));
   
   // Update a reminder
   this.router.put("/reminder/:id", protect, this.reminderController.updateReminder.bind(this.reminderController));
   
   // Delete a reminder
   this.router.delete("/:id", protect, this.reminderController.deleteReminder.bind(this.reminderController));
   
   // Toggle reminder completion status
   this.router.patch("/toggle/:id", protect, this.reminderController.toggleReminderCompletion.bind(this.reminderController));
 }

 getRouter() {
   return this.router;
 }
}