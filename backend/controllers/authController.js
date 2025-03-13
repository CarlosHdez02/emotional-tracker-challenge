import AuthService from "../services/authService";
import { ValidationError } from "../middlewares/errorMiddleware";
import UserService from "../services/userService";

export default class AuthController {
  authService = new AuthService();
  userService = new UserService()

  async login(req, res, next) {
    try {
      const userData = req.body;
      const authenticatedUser = await this.authService.loginUser(userData);
      
      res.status(200).json({
        success: true,
        data: authenticatedUser
      });
    } catch (err) {
      next(err);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ValidationError('Email is required');
      }

      // Find user by email
      const user = await this.userService.findByUserEmail(email)
      
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If your email exists in our system, you will receive a password reset link'
        });
      }

      const resetToken = await this.authService.generateVerificationToken();
      
      // Hash token and save to user
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      // In a real app, you would send an email with the reset token
      // For this example, we'll just return the token in the response
      // In production, you would NOT return the token directly like this
      
      res.status(200).json({
        success: true,
        message: 'If your email exists in our system, you will receive a password reset link',
        resetUrl: `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken } = req.params;
      const { password } = req.body;
      
      if (!password) {
        throw new ValidationError('New password is required');
      }
      
      const result = await this.authService.passwordReset(resetToken, password);
      
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ValidationError('Token is required');
      }
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        throw new AuthError('Invalid token');
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return next(new AuthError('Invalid token'));
      }
      if (err.name === 'TokenExpiredError') {
        return next(new AuthError('Token expired'));
      }
      next(err);
    }
  }
  
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }
      
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Generate new access token
      const newAccessToken = await this.authService.generateToken(decoded.id);
      
      res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return next(new AuthError('Invalid refresh token'));
      }
      if (err.name === 'TokenExpiredError') {
        return next(new AuthError('Refresh token expired'));
      }
      next(err);
    }
  }
}