import Joi from "joi";

export const reminderCreateSchema = Joi.object({
  //userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  title: Joi.string().trim().max(100).required(),
  description: Joi.string().max(500).allow('', null),
  activity: Joi.string().trim().max(100).required(),
  category: Joi.string().valid('meditation', 'exercise', 'journaling', 'breathing', 'social', 'nature', 'other').default('other'),
  scheduledTime: Joi.date().iso().required(),
  frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly').default('once'),
  isCompleted: Joi.boolean().default(false)
});

export const reminderUpdateSchema = Joi.object({
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  title: Joi.string().trim().max(100),
  description: Joi.string().max(500).allow('', null),
  activity: Joi.string().trim().max(100),
  category: Joi.string().valid('meditation', 'exercise', 'journaling', 'breathing', 'social', 'nature', 'other'),
  scheduledTime: Joi.date().iso(),
  frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly'),
  isCompleted: Joi.boolean()
}).min(1);