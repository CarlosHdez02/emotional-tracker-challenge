import ReminderService from "../services/reminderService.js";
import { ValidationError } from "../middlewares/errorMiddleware.js";
import { reminderCreateSchema, reminderUpdateSchema } from "../schemas/reminderSchema.js";

export default class ReminderController {
  reminderService = new ReminderService();

  // Get all reminders for a user
  async getReminders(req, res, next) {
    try {
      const userId = req.user._id;
      const reminders = await this.reminderService.getReminders({ userId });
      
      return res.status(200).json({
        success: true,
        data: reminders,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get a specific reminder
  async getReminderById(req, res, next) {
    try {
      const { id } = req.params;
      const reminder = await this.reminderService.getReminderById(id);
      
      return res.status(200).json({
        success: true,
        data: reminder,
      });
    } catch (err) {
      next(err);
    }
  }

  // Create a new reminder
  async createReminder(req, res, next) {
    try {
      // Validate request body
      const { error, value } = reminderCreateSchema.validate(req.body, { abortEarly: false });
      
      if (error) {
        throw new ValidationError(error.details.map((err) => err.message).join(", "));
      }
      value.userId = req.user._id;
      
      const newReminder = await this.reminderService.createReminder(value);
      
      return res.status(201).json({
        success: true,
        data: newReminder,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update a reminder
  async updateReminder(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate request body
      const { error, value } = reminderUpdateSchema.validate(req.body, { abortEarly: false });
      
      if (error) {
        throw new ValidationError(error.details.map((err) => err.message).join(", "));
      }
      
      // Ensure the reminder belongs to the user
      const existingReminder = await this.reminderService.getReminderById(id);
      if (existingReminder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this reminder"
        });
      }
      
      const updatedReminder = await this.reminderService.updateReminder(id, value);
      
      return res.status(200).json({
        success: true,
        data: updatedReminder,
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete a reminder
  async deleteReminder(req, res, next) {
    try {
      const { id } = req.params;
      
      // Ensure the reminder belongs to the user
      const existingReminder = await this.reminderService.getReminderById(id);
      if (existingReminder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this reminder"
        });
      }
      
      await this.reminderService.deleteReminder(id);
      
      return res.status(200).json({
        success: true,
        message: "Reminder deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  // Toggle reminder completion status
  async   toggleReminderCompletion(req, res, next) {
    try {
      const { id } = req.params;
      
      // Ensure the reminder belongs to the user
      const existingReminder = await this.reminderService.getReminderById(id);
      if (existingReminder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this reminder"
        });
      }
      
      // Toggle the completion status
      const updatedReminder = await this.reminderService.updateReminder(id, {
        isCompleted: !existingReminder.isCompleted
      });
      
      return res.status(200).json({
        success: true,
        data: updatedReminder,
      });
    } catch (err) {
      next(err);
    }
  }
}