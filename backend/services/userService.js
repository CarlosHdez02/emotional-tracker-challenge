import {
  NotFoundError,
  ValidationError,
  AuthError,
} from "../middlewares/errorMiddleware.js";
import User from "../models/userModel.js";

export default class UserService {
  async findByUserEmail(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) throw new NotFoundError("User not found");

      return user;
    } catch (error) {

    }
  }

  // Find user by ID
  async findUserById(id) {
    try {
      const user = await User.findById(id);
      debugger

      // Check if user exists
      if (!user) throw new NotFoundError("User not found");
      debugger

      return user;
    } catch (error) {
 
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser)
        throw new ValidationError("User with that email already exists");
        
      return await User.create(userData);
    } catch (error) {
    }
  }

  async updateUser(userId, userData) {
    const existingUser = await User.findById(userId);
    try {
      if (!existingUser) {
        throw new NotFoundError("There is no user with that id");
      }

      Object.assign(existingUser, userData);
      const updatedUser = await existingUser.save();
      return updatedUser;
    } catch (err) {
      console.error(err);
    }
  }
}
