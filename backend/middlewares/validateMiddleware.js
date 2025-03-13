import Joi from "joi";
import { ValidationError } from "./errorMiddleware.js";

export const validate = (schema)=> (req,res,next)=>{
    const {error} = schema.validate(req.body,{
        aborEarly:false
    })
    if(error){
        const errorDetails = error.details.map(detail=> detail.message);
        return next(new ValidationError('Validation failed', 400, errorDetails))
    }
    next()
}

