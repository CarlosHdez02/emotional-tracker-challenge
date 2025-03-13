import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { AuthError, ForbiddenError } from './errorMiddleware.js';

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET ?? 'mysecretkey123';
console.log(JWT_SECRET)
console.log('secret above')

export const protect = async (req, res, next) => {
  try {
    let token;
    
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        throw new AuthError('Not authorized, no token provided');
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Use projection for efficiency
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          throw new AuthError('User not found');
        }
        
        req.user = user;
        next();
      } catch (error) {
        throw new AuthError('Not authorized, token failed');
      }
    } else {
      throw new AuthError('Not authorized, no token');
    }
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthError('Not authenticated'));
  }
  
  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('Not authorized as admin'));
  }
  
  next();
};