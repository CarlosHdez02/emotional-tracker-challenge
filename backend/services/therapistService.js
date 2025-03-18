import User from '../models/userModel.js';
import {NotFoundError, ValidationError} from '../middlewares/errorMiddleware.js';
import EmotionService from './emotionService.js';
import TherapistDataSharing from '../models/therapistModel.js';

export default class TherapistService {
  constructor() {
    this.emotionService = new EmotionService();
  }

  async getAssignedTherapist(userId) {
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Check if a therapist is assigned
        if (!user.therapistId) {
            throw new ValidationError("No therapist assigned to this user");
        }

        // Fetch therapist details
        const therapist = await User.findById(user.therapistId);
        if (!therapist || therapist.role !== 'therapist') {
            throw new NotFoundError("Assigned therapist not found");
        }

        return {
            success: true,
            message: "Assigned therapist retrieved successfully",
            therapist: therapist.sanitize()
        };
    } catch (err) {
        console.error("Error retrieving assigned therapist:", err);
        throw err;
    }
}

  
  async assignTherapistToUser(userId, therapistEmail) {
    try {
      // Find therapist by email
      const therapist = await User.findOne({ email: therapistEmail, role: 'therapist' });
      if (!therapist) {
        throw new NotFoundError("Therapist not found");
      }
      
      // Update user with therapist ID
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { therapistId: therapist._id },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundError("User not found");
      }
      
      // Automatically create data sharing record
      await this.createDataSharing(userId, therapist._id);
      
      return updatedUser.sanitize();
    } catch (err) {
      console.error("Error assigning therapist:", err);
      throw err;
    }
  }
  
  async removeTherapistFromUser(userId) {
    try {
      // Remove therapist from user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $unset: { therapistId: "" } },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundError("User not found");
      }
      
      // Revoke any active data sharing
      await TherapistDataSharing.updateMany(
        { userId: userId, status: 'active' },
        { status: 'revoked' }
      );
      
      return updatedUser.sanitize();
    } catch (err) {
      console.error("Error removing therapist:", err);
      throw err;
    }
  }
  
  async createDataSharing(userId, therapistId, accessSettings = {}) {
    // Check if a sharing record already exists
    let dataSharing = await TherapistDataSharing.findOne({
      userId: userId,
      therapistId: therapistId
    });
    
    if (dataSharing) {
      // Update existing record
      dataSharing.status = 'active';
      dataSharing.renew(); // Reset expiration to 90 days from now
      
      // Update access settings
      if (accessSettings && Object.keys(accessSettings).length > 0) {
        dataSharing.accessSettings = {
          ...dataSharing.accessSettings,
          ...accessSettings
        };
      }
    } else {
      // Create new data sharing record
      dataSharing = new TherapistDataSharing({
        userId: userId,
        therapistId: therapistId,
        status: 'active',
        accessSettings: accessSettings
      });
    }
    
    await dataSharing.save();
    return dataSharing;
  }
  
  async shareEmotionsWithTherapist(userId) {
    try {
      // Get user with therapist ID
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      
      if (!user.therapistId) {
        throw new ValidationError("No therapist assigned to this user");
      }
      
      // Find data sharing record
      let dataSharing = await TherapistDataSharing.findOne({
        userId: userId,
        therapistId: user.therapistId
      });
      
      // If no sharing record exists, create one automatically
      if (!dataSharing) {
        dataSharing = await this.createDataSharing(userId, user.therapistId);
      } else if (dataSharing.status !== 'active') {
        // If there's an existing record but it's revoked, reactivate it
        dataSharing.status = 'active';
        dataSharing.renew();
        await dataSharing.save();
      }
      
      const accessSettings = dataSharing.accessSettings;
      const sharedData = [];
      const result = {
        success: true,
        sharedWith: user.therapistId,
        sharedAt: new Date(),
        data: {}  
      };
      

      result.data.user = user.sanitize();
      sharedData.push('userProfile');
      

      result.data.summary = await this.emotionService.getEmotionSummary(userId);
      sharedData.push('emotionSummary');
      

      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - (accessSettings.duration || 30));
      
      result.data.recentEmotions = await this.emotionService.getUserEmotions({
        user: userId,
        createdAt: { $gte: lookbackDate }
      });
      sharedData.push('recentEmotions');
      

      const sharedDataEntry = {
        userProfile: result.data.user,
        emotionSummary: result.data.summary,
        recentEmotions: result.data.recentEmotions,
        sharedAt: new Date()
      };
  

      dataSharing.sharedData.push(sharedDataEntry);
      
      // Make sure we only keep the 5 most recent entries
      if (dataSharing.sharedData.length > 5) {
        dataSharing.sharedData = dataSharing.sharedData.slice(-5);
      }
      

      dataSharing.logAccess(sharedData);
      await dataSharing.save();
      
      return result;
    } catch (err) {
      console.error("Error sharing emotions with therapist:", err);
      throw err;
    }
  }
  
  async getTherapistDetails(userId, therapistId) {
    try {
      // Get the therapist information
      const therapist = await User.findById(therapistId);
      if (!therapist || therapist.role !== 'therapist') {
        throw new NotFoundError("Therapist not found");
      }
  
      // Get the user information
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
  
      let dataSharing = await TherapistDataSharing.findOne({
        userId: userId,
        therapistId: therapistId
      });
  
      if (!dataSharing) {
        dataSharing = await this.createDataSharing(userId, therapistId);
      }
  
      const accessSettings = dataSharing.accessSettings;
      const sharedData = ['therapistDetails', 'userProfile'];
      const result = {
        therapist: therapist.sanitize(),
        user: user.sanitize(),
        dataSharing: {
          status: dataSharing.status,
          isActive: dataSharing.isActive(),
          expiresAt: dataSharing.expiresAt,
          accessSettings: dataSharing.accessSettings,
          lastShared: dataSharing.lastShared
        },
        data: {}
      };
  
      result.data.summary = await this.emotionService.getEmotionSummary(userId);
      sharedData.push('emotionSummary');
  
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - (accessSettings.duration || 30));
      
      result.data.recentEmotions = await this.emotionService.getUserEmotions({
        user: userId,
        createdAt: { $gte: lookbackDate }
      });
      sharedData.push('recentEmotions');
  
      const sharedDataEntry = {
        userProfile: result.user,
        emotionSummary: result.data.summary,
        recentEmotions: result.data.recentEmotions,
        sharedAt: new Date()
      };
  
      // Add to the sharedData array
      dataSharing.sharedData.push(sharedDataEntry);
      
     
      if (dataSharing.sharedData.length > 5) {
        dataSharing.sharedData = dataSharing.sharedData.slice(-5);
      }
  

      dataSharing.logAccess(sharedData);
      await dataSharing.save();
  
      return result;
    } catch (err) {
      console.error("Error getting therapist details:", err);
      throw err;
    }
  }
  
}