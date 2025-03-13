import Joi from "joi";

export const emotionCreateSchema = Joi.object({
    mood: Joi.string().valid('happy','sad','angry','anxious','neutral').required(),
    intensity: Joi.number().integer().min(1).max().required(),
    notes:Joi.string().max(500).allow('',null),
    triggers:Joi.array().items(Joi.string().max(50)).max(5),
    activites:Joi.array().items(Joi.string().max(50)).max(5),
    date:Joi.date().iso().max('now').default(Date.now)
})

export const emotionUpdateSchema = emotionCreateSchema.fork(['emotion', 'intensity'], schema => schema.optional());