import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor ingrese un título'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Por favor ingrese un destino'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Por favor ingrese un precio'],
    min: 0,
  },
  duration: {
    days: {
      type: Number,
      required: [true, 'Por favor ingrese la duración en días'],
      min: 1,
    },
    nights: {
      type: Number,
      required: [true, 'Por favor ingrese la duración en noches'],
      min: 0,
    },
  },
  included: {
    type: [String],
    required: [true, 'Por favor ingrese qué incluye el paquete'],
  },
  notIncluded: {
    type: [String],
    required: [true, 'Por favor ingrese qué no incluye el paquete'],
  },
  images: [
    {
      url: String,
      alt: String,
    },
  ],
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },
  status: {
    type: String,
    enum: ['Creado', 'Listado', 'Archivado'],
    default: 'Creado',
  },
  minPeople: {
    type: Number,
    default: 1,
    min: 1,
  },
  maxPeople: {
    type: Number,
    required: [true, 'Por favor ingrese el máximo de personas'],
    min: 1,
  },
  startDates: [
    {
      date: {
        type: Date,
        required: true,
      },
      availableSpots: {
        type: Number,
        required: true,
        min: 0,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  itinerary: [
    {
      day: Number,
      title: String,
      description: String,
      activities: [
        {
          time: String,
          description: String,
        },
      ],
      meals: {
        breakfast: Boolean,
        lunch: Boolean,
        dinner: Boolean,
      },
      accommodation: String,
    },
  ],
  category: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PackageSchema.index({ agencyId: 1 });
PackageSchema.index({ destination: 1 });
PackageSchema.index({ status: 1 });
PackageSchema.index({ category: 1 });
PackageSchema.index({ price: 1 });
PackageSchema.index({ 'duration.days': 1 });
PackageSchema.index({ 'startDates.date': 1 });

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);