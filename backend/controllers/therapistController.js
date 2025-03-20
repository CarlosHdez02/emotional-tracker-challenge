import TherapistService from "../services/therapistService.js";

export default class TherapistController {
  constructor() {
    this.therapistService = new TherapistService();
  }

  async assignTherapist(req, res, next) {
    try {
      const userId = req.user._id;
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Therapist email is required"
        });
      }

      
      
      const updatedUser = await this.therapistService.assignTherapistToUser(userId, email);
      res.status(200).json({
        success: true,
        message: "Therapist assigned and data sharing enabled",
        data: updatedUser,
        therapistId: updatedUser.therapistId
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssignedTherapist(req, res, next) {
    try {
      const userId = req.user._id;
      
      const result = await this.therapistService.getAssignedTherapist(userId);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async shareEmotions(req, res, next) {
    try {
      // Get user ID from authenticated user
      const userId = req.user._id;
      
    
      const result = await this.therapistService.shareEmotionsWithTherapist(userId);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  async removeTherapist(req, res, next) {
    try {
      const userId = req.user._id;
      const updatedUser = await this.therapistService.removeTherapistFromUser(userId);
      res.status(200).json({
        success: true,
        message: "Therapist removed and data sharing revoked",
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getTherapistDetails(req, res, next) {
    try {
      const userId = req.user._id;
      const { therapistId } = req.params;
      
      if (!therapistId) {
        return res.status(400).json({
          success: false,
          message: "Therapist ID is required"
        });
      }
      
      
      const result = await this.therapistService.getTherapistDetails(userId, therapistId);
      const isAssigned = req.user.therapistId && req.user.therapistId.toString() === therapistId;
      
      res.status(200).json({
        success: true,
        data: {
          therapist: result.therapist,
          user: result.user,
          dataSharing: result.dataSharing,
          isAssigned: isAssigned,
          summary: result.data.summary,
          recentEmotions: result.data.recentEmotions
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async requestDataSharing(req, res, next) {
    try {
      const userId = req.user._id;
      const { email, accessSettings } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Therapist email is required"
        });
      }
      
      const result = await this.therapistService.requestDataSharing(userId, email, accessSettings);
      
      res.status(200).json({
        success: true,
        message: "Data sharing enabled",
        data: {
          id: result._id,
          therapistId: result.therapistId,
          status: result.status,
          expiresAt: result.expiresAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
}