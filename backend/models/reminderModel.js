import mongoose from "mongoose";

const mentalHealthReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  activity: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['meditation', 'exercise', 'journaling', 'breathing', 'social', 'nature', 'other'],
    default: 'other'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Reminder = mongoose.model("Reminder", mentalHealthReminderSchema)
export default Reminder