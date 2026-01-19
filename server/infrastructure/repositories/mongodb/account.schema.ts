import { Schema } from 'mongoose';

export const AccountSchema = new Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  nickname: { 
    type: String, 
    required: true
  },
  level: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    default: '' 
  },
  avatar64: { 
    type: String, 
    default: null 
  },
  avatarPath: { 
    type: String, 
    default: null 
  },
  avatarFilename: { 
    type: String, 
    default: null 
  },
  // Add any other fields your Player entity has
  // For example:
  // experience: { type: Number, default: 0 },
  // inventory: { type: Array, default: [] },
  // etc.
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'accounts' // Explicitly set collection name
});