import mongoose from 'mongoose';

const ItineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  activities: [{
    time: String,
    description: String,
  }],
  meals: {
    breakfast: Boolean,
    lunch: Boolean,
    dinner: Boolean,
  },
  accommodation: {
    type: String,
    required: true,
  },
});

const PackageSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Por favor ingrese el título del paquete'],
    minlength: [5, 'El título debe tener al menos 5 caracteres'],
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    minlength: [20, 'La descripción debe tener al menos 20 caracteres'],
  },
  destination: {
    type: String,
    required: [true, 'Por favor ingrese el destino'],
  },
  price: {
    type: Number,
    required: [true, 'Por favor ingrese el precio'],
    min: [0, 'El precio no puede ser negativo'],
  },
  duration: {
    days: {
      type: Number,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
  },
  included: [{
    type: String,
    required: true,
  }],
  notIncluded: [{
    type: String,
    required: true,
  }],
  images: [{
    url: String,
    alt: String,
  }],
  itinerary: [ItineraryDaySchema],
  startDates: [{
    date: Date,
    availableSpots: Number,
    price: Number,
  }],
  category: [{
    type: String,
    enum: ['Playa', 'Montaña', 'Ciudad', 'Aventura', 'Relax', 'Cultural', 'Familiar', 'Romántico', 'Lujo', 'Económico'],
  }],
  minPeople: {
    type: Number,
    default: 1,
  },
  maxPeople: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Creado', 'Listado', 'Archivado'],
    default: 'Creado',
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

PackageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);