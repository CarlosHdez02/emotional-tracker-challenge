import Joi from "joi";

export const emotionCreateSchema = Joi.object({
    emotion: Joi.string().valid('happy','sad','angry','anxious','neutral').required(),
    intensity: Joi.number().integer().min(1).max(10).required(),
    notes: Joi.string().max(500).allow('',null).required(),
    triggers: Joi.array().items(Joi.string().max(50)).max(5).required(),
    activities: Joi.array().items(Joi.string().max(50)).max(5).required(),
    date: Joi.date().iso().max('now').default(Date.now)
});

export const emotionUpdateSchema = Joi.object({
    emotion: Joi.string().valid('happy','sad','angry','anxious','neutral'),
    intensity: Joi.number().integer().min(1).max(10),
    notes: Joi.string().max(500).allow('',null),
    triggers: Joi.array().items(Joi.string().max(50)).max(5),
    activities: Joi.array().items(Joi.string().max(50)).max(5),
    date: Joi.date().iso().max('now')
}).min(1);
