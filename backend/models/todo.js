const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['personal', 'assigned'],
    required: true
  },
  deadline: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
todoSchema.index({ assignedTo: 1, status: 1 });
todoSchema.index({ assignedTo: 1, type: 1 });
todoSchema.index({ assignedTo: 1, priority: 1 });
todoSchema.index({ createdBy: 1 });
todoSchema.index({ deadline: 1 });
todoSchema.index({ type: 1, isViewed: 1 });

// Static method to get user's todos with population
todoSchema.statics.getUserTodos = function(userId, filters = {}) {
  const query = { assignedTo: userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.priority) query.priority = filters.priority;
  
  return this.find(query)
    .populate('createdBy', 'firstName lastName username role')
    .populate('assignedTo', 'firstName lastName username studentId')
    .sort({ createdAt: -1 });
};

// Static method to get admin todos with population
todoSchema.statics.getAdminTodos = function(filters = {}) {
  const query = {};
  
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  
  return this.find(query)
    .populate('createdBy', 'firstName lastName username role')
    .populate('assignedTo', 'firstName lastName username studentId')
    .sort({ createdAt: -1 });
};

// Instance method to update status
todoSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'done') {
    this.completedAt = new Date();
  } else {
    this.completedAt = undefined;
  }
  return this.save();
};

// Instance method to mark as viewed
todoSchema.methods.markAsViewed = function() {
  this.isViewed = true;
  return this.save();
};

// Virtual for checking if overdue
todoSchema.virtual('isOverdue').get(function() {
  return this.deadline && new Date(this.deadline) < new Date() && this.status !== 'done';
});

// Include virtuals when converting to JSON
todoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Todo', todoSchema);