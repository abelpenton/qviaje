import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Índices para mejorar el rendimiento de las consultas
FavoriteSchema.index({ userId: 1 });
FavoriteSchema.index({ packageId: 1 });
FavoriteSchema.index({ userId: 1, packageId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);