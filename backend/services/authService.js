import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import crypto from "crypto";
import UserService from "./userService.js";
import { AuthError, NotFoundError } from "../middlewares/errorMiddleware.js";

export default class AuthService {
  usersService = new UserService();

  async generateToken(id) {
    try {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
      });
    } catch (err) {
      console.error("Error generating token:", err);
      throw new AuthError("Failed to generate authentication token");
    }
  }

  async generateRefreshToken(id) {
    try {
      return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "90d",
      });
    } catch (err) {
      console.error("Error generating refresh token:", err);
      throw new AuthError("Failed to generate refresh token");
    }
  }

  async generateVerificationToken() {
    return crypto.randomBytes(20).toString("hex");
  }

  async loginUser(userData) {
    try {
      const { email, password } = userData;

      const user = await User.findOne({ email });

      if (!user) {
        throw new NotFoundError("There is no user in database with that email");
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new AuthError("Invalid password");
      }

      const token = await this.generateToken(user._id);
      const refreshToken = await this.generateRefreshToken(user._id);

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role:user.role,
        token,
        refreshToken
      };
    } catch (err) {
      console.error("Login error:", err);
      throw err; // Rethrow to be handled by middleware
    }
  }

  async createPasswordResetToken(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new NotFoundError("User not found with that email");
      }

      // Generate reset token
      const resetToken = await this.generateVerificationToken();
      
      // Hash token before saving to database
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      
      // Set token and expiry in database
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
      
      await user.save();
      
      return resetToken; // Return unhashed token to be sent via email
    } catch (err) {
      console.error("Password reset token error:", err);
      throw err;
    }
  }

  async passwordReset(resetToken, newPassword) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
        
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
      
      if (!user) {
        throw new AuthError("Invalid or expired reset token");
      }
      
      user.password = newPassword;
      user.resetPasswordExpire = undefined; // undefined clears the field in MongoDB
      user.resetPasswordToken = undefined;
      
      await user.save();

      return { success: true };
    } catch (err) {
      console.error("Password reset error:", err);
      throw err;
    }
  }
}