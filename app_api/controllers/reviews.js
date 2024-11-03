const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

// Helper function to update the average rating
const doSetAverageRating = async (location) => {
    if (location.reviews && location.reviews.length > 0) {
        const count = location.reviews.length;
        const total = location.reviews.reduce((acc, { rating }) => acc + rating, 0);
        location.rating = (total / count).toFixed(2); // Calculate and format average rating

        try {
            await location.save();
            console.log(`Average rating updated to ${location.rating}`);
        } catch (err) {
            console.error("Error saving average rating:", err);
        }
    } else {
        location.rating = 0; // Reset rating if no reviews
        await location.save();
    }
};

// Update the average rating after a review is modified
const updateAverageRating = async (locationId) => {
    try {
        const location = await Loc.findById(locationId).select('rating reviews');
        if (location) {
            await doSetAverageRating(location);
        }
    } catch (err) {
        console.error("Error updating average rating:", err);
    }
};

// Create a new review
const reviewsCreate = async (req, res) => {
    const locationId = req.params.locationid;

    if (!locationId) {
        return res.status(404).json({ "message": "Location ID is required" });
    }

    try {
        const location = await Loc.findById(locationId).select('reviews');
        if (!location) {
            return res.status(404).json({ "message": "Location not found" });
        }

        const { author, rating, reviewText } = req.body;
        location.reviews.push({ author, rating, reviewText });

        const updatedLocation = await location.save();
        await updateAverageRating(updatedLocation._id); // Update average rating

        const newReview = updatedLocation.reviews.slice(-1).pop(); // Get the newly added review
        return res.status(201).json(newReview);
    } catch (err) {
        console.error("Error creating review:", err);
        return res.status(400).json(err);
    }
};

// Read a specific review by location and review IDs
const reviewsReadOne = async (req, res) => {
    const { locationid, reviewid } = req.params;

    try {
        const location = await Loc.findById(locationid).select('name reviews');
        if (!location) {
            return res.status(404).json({ "message": "Location not found" });
        }

        const review = location.reviews.id(reviewid);
        if (!review) {
            return res.status(404).json({ "message": "Review not found" });
        }

        res.status(200).json({
            location: {
                name: location.name,
                id: locationid
            },
            review
        });
    } catch (err) {
        console.error("Error reading review:", err);
        return res.status(400).json({ "error": "An error occurred", details: err });
    }
};

// Update an existing review
const reviewsUpdateOne = async (req, res) => {
    const { locationid, reviewid } = req.params;

    if (!locationid || !reviewid) {
        return res.status(404).json({ "message": "Location ID and Review ID are required" });
    }

    try {
        const location = await Loc.findById(locationid).select('reviews');
        if (!location) {
            return res.status(404).json({ "message": "Location not found" });
        }

        const review = location.reviews.id(reviewid);
        if (!review) {
            return res.status(404).json({ "message": "Review not found" });
        }

        // Update the review fields
        review.author = req.body.author || review.author;
        review.rating = req.body.rating || review.rating;
        review.reviewText = req.body.reviewText || review.reviewText;

        await location.save();
        await updateAverageRating(locationid); // Update the average rating

        return res.status(200).json(review);
    } catch (err) {
        console.error("Error updating review:", err);
        return res.status(400).json(err);
    }
};

// Delete a review
const reviewsDeleteOne = async (req, res) => {
    const { locationid, reviewid } = req.params;

    if (!locationid || !reviewid) {
        return res.status(404).json({ "message": "Location ID and Review ID are required" });
    }

    try {
        const location = await Loc.findById(locationid).select('reviews');
        if (!location) {
            return res.status(404).json({ "message": "Location not found" });
        }

        const review = location.reviews.id(reviewid);
        if (!review) {
            return res.status(404).json({ "message": "Review not found" });
        }

        // Remove the review by using the array method
        location.reviews.pull(reviewid);  // Use pull to remove the review from the array
        await location.save();  // Save the updated location with the review removed
        await updateAverageRating(locationid); // Update the average rating

        return res.status(204).json(null); // Return 204 No Content
    } catch (err) {
        console.error("Error deleting review:", err);
        return res.status(400).json(err); // Return 400 Bad Request in case of error
    }
};


module.exports = {
    reviewsCreate,
    reviewsReadOne,
    reviewsUpdateOne,
    reviewsDeleteOne
};





