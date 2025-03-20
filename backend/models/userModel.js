import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin","therapist"], // added therapist role
    default: "user"
  },
  phone: String,
  therapistId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compareSync(enteredPassword, this.password);
};

// Method to sanitize user data before sending to client
userSchema.methods.sanitize = function() {
  const userObject = this.toObject();
  
  // Remove sensitive fields
  delete userObject.password;
  

  
  return userObject;
};

// Static method to sanitize multiple users at once
userSchema.statics.sanitizeMany = function(users) {
  return users.map(user => {
    const userObject = user.toObject ? user.toObject() : user;
    delete userObject.password;
    return userObject;
  });
};

const User = mongoose.model("User", userSchema);

export default User;