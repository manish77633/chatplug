const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  plan: {
    type:      { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    expiresAt: { type: Date },
  },

  usage: {
    totalTokens:    { type: Number, default: 0 },
    totalMessages:  { type: Number, default: 0 },
    totalDocuments: { type: Number, default: 0 },
    currentMonth: {
      tokens:   { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
    },
  },

  limits: {
    maxChatbots:  { type: Number, default: 2 },
    maxDocuments: { type: Number, default: 10 },
    maxTokens:    { type: Number, default: 100000 },
  },

  apiKey:          { type: String, unique: true, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin:       { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set limits based on plan
userSchema.methods.applyPlanLimits = function () {
  const limits = {
    free:       { maxChatbots: 2,   maxDocuments: 10,  maxTokens: 100_000 },
    pro:        { maxChatbots: 10,  maxDocuments: 100, maxTokens: 1_000_000 },
    enterprise: { maxChatbots: 999, maxDocuments: 999, maxTokens: 999_999_999 },
  };
  this.limits = limits[this.plan.type] || limits.free;
};

module.exports = mongoose.model('User', userSchema);
