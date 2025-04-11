const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tag schema definition
const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  color: {
    type: String,
    default: '#2196f3',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
tagSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Tag model
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
