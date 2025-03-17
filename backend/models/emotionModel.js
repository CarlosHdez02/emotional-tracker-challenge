import mongoose from "mongoose";

const emotionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'angry', 'anxious', 'neutral']
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: String,
  triggers: [String],
  activities: [String]
});

// TODO: Define indexes for performance

emotionSchema.index({ user: 1, date: -1 });

emotionSchema.index({ user: 1, emotion: 1 });

emotionSchema.index({ date: -1 });

emotionSchema.statics.getEmotionStats = function(userId) {
  return this.aggregate([

    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    

    { 
      $group: { 
        _id: '$emotion',
        count: { $sum: 1 },
        avgIntensity: { $avg: '$intensity' },
        maxIntensity: { $max: '$intensity' },
        minIntensity: { $min: '$intensity' },

        lastRecorded: { $max: '$date' }
      } 
    },
    

    {
      $project: {
        emotion: '$_id',
        _id: 0,
        count: 1,
        avgIntensity: { $round: ['$avgIntensity', 1] },
        maxIntensity: 1,
        minIntensity: 1,
        lastRecorded: 1
      }
    },
    

    { $sort: { count: -1 } }
  ]);
};


emotionSchema.statics.getEmotionTrends = function(userId, startDate, endDate) {
  return this.aggregate([

    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId),
        date: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        } 
      } 
    },
    

    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          emotion: "$emotion"
        },
        avgIntensity: { $avg: "$intensity" },
        count: { $sum: 1 }
      }
    },
    

    {
      $project: {
        _id: 0,
        date: "$_id.date",
        emotion: "$_id.emotion",
        avgIntensity: { $round: ["$avgIntensity", 1] },
        count: 1
      }
    },
    

    { $sort: { date: 1, emotion: 1 } }
  ]);
};


emotionSchema.statics.getCommonTriggers = function(userId) {
  return this.aggregate([

    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    

    { $unwind: "$triggers" },
    

    {
      $group: {
        _id: {
          emotion: "$emotion",
          trigger: "$triggers"
        },
        count: { $sum: 1 },
        avgIntensity: { $avg: "$intensity" }
      }
    },
    
    {
      $group: {
        _id: "$_id.emotion",
        triggers: {
          $push: {
            name: "$_id.trigger",
            count: "$count",
            avgIntensity: { $round: ["$avgIntensity", 1] }
          }
        }
      }
    },
    
    {
      $project: {
        emotion: "$_id",
        _id: 0,
        triggers: {
          $slice: [
            { $sortArray: { input: "$triggers", sortBy: { count: -1 } } },
            5 
          ]
        }
      }
    }
  ]);
};

const Emotion = mongoose.model('Emotion', emotionSchema);

export default Emotion;