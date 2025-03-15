import Reminder from "../models/reminderModel.js";
import { NotFoundError } from "../middlewares/errorMiddleware.js";

export default class ReminderService{

    async getReminders(reminder){
        try{
            const reminders = await Reminder.find(reminder)
            return reminders
        }catch(err){
            console.error("error at service")
            throw err;
        }
    }
    
    async getReminderById(reminderId){
        try{
            const existingReminder = await Reminder.findById(reminderId);
            if(!existingReminder) throw new NotFoundError("Reminder not found")
            return existingReminder
        }catch(err){
            console.error("Error fetching reminder by ID:", err);
            throw err;
        }
    }

    async createReminder(reminderData){
        try{
            const newReminder = await Reminder.create(reminderData);
            return newReminder
        }catch(err){
            console.error(err)
            throw err;
        }
    }

    async updateReminder(reminderId, reminderData){
        try{
            const existingReminder = await Reminder.findById(reminderId);
            if(!existingReminder) throw new NotFoundError("Reminder not found");
            
            const updatedReminder = await Reminder.findByIdAndUpdate(
                reminderId,
                reminderData,
                { new: true, runValidators: true }
            );
            
            return updatedReminder;
        }catch(err){
            console.error("Error updating reminder:", err);
            throw err;
        }
    }
    
    async deleteReminder(reminderId){
        try{
            const existingReminder = await Reminder.findById(reminderId);
            if(!existingReminder) throw new NotFoundError("Reminder not found");
            
            await Reminder.findByIdAndDelete(reminderId);
            return { message: "Reminder deleted successfully" };
        }catch(err){
            console.error("Error deleting reminder:", err);
            throw err;
        }
    }
}