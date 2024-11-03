const mongoose = require('mongoose');

// Define the reviews subdocument schema
const reviewSchema = new mongoose.Schema({
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewText: { type: String, required: true },
    createdOn: { type: Date, 'default': Date.now }
});

// Define the openingTimes subdocument schema
const openingTimeSchema = new mongoose.Schema({
    days: { type: String, required: true },
    opening: String,
    closing: String,
    closed: { type: Boolean, required: true }
});

// Define the main location schema
const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    rating: {
        type: Number,
        default: 0,  // No quotes around 'default'
        min: 0,
        max: 5
    },
    facilities: [String],
    coords: {
        type: { type: String, enum: ['Point'], required: true },  // Enforce GeoJSON Point type
        coordinates: {
            type: [Number],
            required: true  // Ensure coordinates are provided
        }
    },
    openingTimes: [openingTimeSchema],  // Embed openingTimes schema
    reviews: [reviewSchema]  // Embed reviews schema
});

// Set a 2dsphere index for geospatial queries on the coords field
locationSchema.index({ coords: '2dsphere' });

// Export the model
module.exports = mongoose.model('Location', locationSchema);

