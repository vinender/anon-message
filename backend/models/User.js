// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  // Username field: required for traditional sign-up, optional for Google users
  username: { 
    type: String, 
    required: function() {
      return !this.googleId; // Username is required if not a Google user
    }, 
    unique: true,
    minlength: 3,
    trim: true,
  },
  
  // Email field: required for all users
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'], // Basic email format validation
  },
  
  // Password field: required for traditional sign-up, not required for Google users
  password: { 
    type: String, 
    required: function() {
      return !this.googleId; // Password is required if not a Google user
    },
    minlength: 6,
  },
  
  // Google ID field: unique identifier for Google-authenticated users
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows multiple documents with null value
  },
  
  // RSA Public Key: used for encrypting messages
  publicKey: { 
    type: String, 
    required: true,
  },
  
  // RSA Private Key: used for decrypting messages
  privateKey: { 
    type: String, 
    required: true,
  },
  
  // Fields for "Forgot Password" functionality
  resetPasswordToken: String, // Token for password reset verification
  resetPasswordExpires: Date, // Expiration time for the reset token
}, { timestamps: true });

// Pre-save hook to hash passwords before saving to the database
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare a candidate password with the hashed password in the database
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
