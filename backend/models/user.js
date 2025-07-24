const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: true,
    sparse: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  customGender: {
    type: String,
    trim: true,
    maxlength: 50,
    required: function() { return this.gender === 'other'; },
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Kazakhstan' }
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
    required: function() { return this.role === 'student'; },
  },
  faculty: {
    type: String,
    trim: true,
    required: function() { return this.role === 'student'; },
  },
  course: {
    type: Number,
    min: 1,
    max: 6,
    required: function() { return this.role === 'student'; },
  },
  specialization: {
    type: String,
    trim: true,
    required: function() { return this.role === 'student'; },
  },
}, { 
  timestamps: true 
});

userSchema.index({ studentId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ faculty: 1, course: 1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);