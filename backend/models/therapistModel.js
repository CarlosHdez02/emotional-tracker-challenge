import mongoose from 'mongoose';

// Schema for access logs
const accessLogSchema = new mongoose.Schema({
  accessedAt: {
    type: Date,
    default: Date.now
  },
  accessedData: {
    type: [String],
    required: true
  }
}, { _id: false });

// Schema for shared data entries
const sharedDataEntrySchema = new mongoose.Schema({
  userProfile: {
    type: Object
  },
  emotionSummary: {
    type: Object
  },
  recentEmotions: {
    type: Array
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Schema for access settings
const accessSettingsSchema = new mongoose.Schema({
  emotionSummary: {
    type: Boolean,
    default: true
  },
  recentEmotions: {
    type: Boolean,
    default: true
  },
  userProfile: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 30,
    min: 1,
    max: 90
  }
}, { _id: false });

const therapistDataSharingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 90); // Default 90 days
      return date;
    }
  },
  lastShared: {
    type: Date
  },
  accessSettings: {
    type: accessSettingsSchema,
    default: () => ({})
  },
  accessLogs: {
    type: [accessLogSchema],
    default: []
  },
  // Add sharedData field to store historical emotion data
  sharedData: {
    type: [sharedDataEntrySchema],
    default: []
  }
});


therapistDataSharingSchema.index({ userId: 1, therapistId: 1 }, { unique: true });


therapistDataSharingSchema.methods.isActive = function() {
  return this.status === 'active' && this.expiresAt > new Date();
};


therapistDataSharingSchema.methods.logAccess = function(accessedData) {
  this.lastShared = new Date();
  this.accessLogs.push({
    accessedAt: new Date(),
    accessedData: accessedData
  });
  return this;
};


therapistDataSharingSchema.methods.renew = function(days = 90) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  this.expiresAt = expiryDate;
  return this;
};


therapistDataSharingSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    userId: userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).populate('therapistId', 'name email');
};


therapistDataSharingSchema.statics.findActiveClientsForTherapist = function(therapistId) {
  return this.find({
    therapistId: therapistId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'name email');
};

const TherapistDataSharing = mongoose.model('TherapistDataSharing', therapistDataSharingSchema);

export default TherapistDataSharing;