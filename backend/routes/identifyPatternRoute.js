import IdentifyPatternController from "../controllers/identifyPatternController.js";
import { protect } from "../middlewares/authMiddleware.js";
import express from 'express'


export default class IdentifyPatternRoute{
    router = express.Router();
    identifyController = new IdentifyPatternController()

    constructor(){
        this.initializeRoutes()
    }

    //  my routes

    initializeRoutes(){
        this.router.get('/', protect, this.identifyController.getPattenrs.bind(this.identifyController))
    }
    getRouter(){
        return this.router
    }
}