import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        required: [true, 'Por favor ingrese un teléfono'],
        trim: true,
    },
    photo: {
        type: String,
        required: [true, 'Por favor suba una foto'],
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpiry: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);