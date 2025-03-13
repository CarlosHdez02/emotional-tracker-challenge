import Joi from 'joi';

export const userCreateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(4).max(15),
    role: Joi.string().valid("admin", "user").required(),
    phone: Joi.string().length(10).optional(), 
  })