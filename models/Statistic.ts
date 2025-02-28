import mongoose from 'mongoose';

const StatisticSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true,
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: false,
    },
    type: {
        type: String,
        enum: ['view', 'inquiry'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Índices para mejorar el rendimiento de las consultas
StatisticSchema.index({ agencyId: 1, createdAt: -1 });
StatisticSchema.index({ packageId: 1, createdAt: -1 });
StatisticSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Statistic || mongoose.model('Statistic', StatisticSchema);