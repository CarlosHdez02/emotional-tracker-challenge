import UserService from '../services/userService.js';
import AuthService from '../services/authService.js';
import { ValidationError } from '../middlewares/errorMiddleware.js';
import { userCreateSchema } from '../schemas/userSchema.js';

export default class UserController {
  userService = new UserService();
  authService = new AuthService();

  // Register user
  async registerUser(req, res, next) {
    try {
      // Validate request body
      const { error, value } = userCreateSchema.validate(req.body, { abortEarly: false });
  
      if (error) {
        throw new ValidationError(error.details.map((err) => err.message).join(", "));
      }
      const newUser = await this.userService.createUser(value);
      const token = await this.authService.generateToken(newUser._id);
  
      return res.status(201).json({
        success: true,
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  // Login user
  async loginUser(req, res, next) {
    try {
      const userData = req.body;
      
      if (!userData.email || !userData.password) {
        throw new ValidationError("Please provide email and password");
      }
      if(!userData.email.includes('@')){
        throw new ValidationError("Please provide proper email format with domain")
      }
      
      const authData = await this.authService.loginUser(userData);
      
      res.status(200).json({
        success: true,
        data: authData
      });
    } catch (err) {
      next(err);
    }
  }

  // Get user profile
  async getUserProfile(req, res, next) {
    try {
      const { id } = req.params; 
      debugger
      const user = await this.userService.findUserById(id);
      if (!user) throw new Error("User not found");
  
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
  

  // Update user
  async updateUser(req, res, next) {
    try {
      // Get user ID from authenticated user in req object (set by protect middleware)
      const id = req.user._id;
      
      // Prevent password updates through this endpoint
      if (req.body.password) {
        throw new ValidationError("This route is not for password updates. Please use /password-reset");
      }
      
      const updatedUser = await this.userService.updateUser(id, req.body);
      
      return res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email
          // Add other non-sensitive fields as needed
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Request password reset
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ValidationError("Please provide an email address");
      }
      
      const resetToken = await this.authService.createPasswordResetToken(email);
      
      // In a real application, you would send the token via email
      // For development purposes, you might return it in the response
      
      return res.status(200).json({
        success: true,
        message: "Password reset token generated successfully",
        // Remove this in production, send via email instead
        resetToken
      });
    } catch (err) {
      next(err);
    }
  }

  // Reset password using token
  async resetPassword(req, res, next) {
    try {
      const { resetToken } = req.params;
      const { password } = req.body;
      
      if (!password) {
        throw new ValidationError("Please provide a new password");
      }
      
      await this.authService.passwordReset(resetToken, password);
      
      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully"
      });
    } catch (err) {
      next(err);
    }
  }
}