import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AgencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese un email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false,
  },
  description: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'premium'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Agency || mongoose.model('Agency', AgencySchema);