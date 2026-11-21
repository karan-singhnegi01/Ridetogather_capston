const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    // relationship: Ride -> User (driver)
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, required: [true, 'Source is required'], trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
      validate: {
        validator: function (value) {
          // only check for new rides
          return !this.isNew || value > new Date();
        },
        message: 'Departure time must be in the future',
      },
    },
    fare: { type: Number, required: [true, 'Fare is required'], min: [0, 'Fare cannot be negative'] },
    totalSeats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'At least 1 seat is required'],
      max: [8, 'Maximum 8 seats allowed'],
    },
    availableSeats: { type: Number, min: 0 },
    status: { type: String, enum: ['open', 'completed', 'cancelled'], default: 'open' },
  },
  { timestamps: true }
);

// available seats start equal to total seats
rideSchema.pre('validate', function () {
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.totalSeats;
  }
});

// index to make route + date search faster
rideSchema.index({ source: 1, destination: 1, departureTime: 1 });

module.exports = mongoose.model('Ride', rideSchema);
