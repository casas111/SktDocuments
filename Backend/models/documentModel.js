const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Document schema definition
const documentSchema = new Schema({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  folderId: {
    type: String,
    default: 'root'
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  starred: {
    type: Boolean,
    default: false
  },
  locked: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    nodeId: String,
    nodeType: String,
    inputId: String,
    description: String
  }
});

// Create the Document model
const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
