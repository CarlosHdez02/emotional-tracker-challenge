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

  async getUsers(req, res, next) {
    try {
        const users = await this.userService.findUsers();
        return res.status(200).json({
            success: true,
            data: { users }
        });
    } catch (err) {
        next(err);
    }
}
  

  // Update user
  async updateUser(req, res, next) {
    try {
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
        }
      });
    } catch (err) {
      next(err);
    }
  }

  
  async updatePassword(req, res, next) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      // Validate inputs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Current password and new password are required" 
        });
      }
      
      const result = await this.userService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}