import mongoose from 'mongoose';

const AgencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese el nombre de la agencia'],
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese un email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: 6,
    select: false,
  },
  logo: {
    type: String,
    required: [true, 'Por favor suba un logo'],
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres'],
  },
  address: {
    type: String,
    required: [true, 'Por favor ingrese una dirección'],
  },
  phone: {
    type: String,
    required: [true, 'Por favor ingrese un teléfono'],
  },
  website: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Agency || mongoose.model('Agency', AgencySchema);