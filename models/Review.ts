import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    rating: {
        type: Number,
        required: [true, 'Por favor ingrese una calificación'],
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: [true, 'Por favor ingrese un comentario'],
        trim: true,
    },
    images: [{
        url: String,
        alt: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Índices para mejorar el rendimiento de las consultas
ReviewSchema.index({ packageId: 1 });
ReviewSchema.index({ userId: 1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);