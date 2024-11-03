const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

// Function to convert meters to kilometers
const meterToKilometer = (meters) => meters / 1000;

const showError = (req, res, status) => {
    let title = '';
    let content = '';

    if (status === 404) {
        title = '404, page not found';
        content = 'Oh dear. Looks like the location you are looking for does not exist. Sorry.';
    } else {
        title = `${status}, something's gone wrong`;
        content = 'Something, somewhere, has gone just a little bit wrong.';
    }

    res.status(status);
    res.render('generic-text', {
        title,
        content
    });
};

// List locations by distance
const locationsListByDistance = async (req, res) => {
    const { lng, lat, maxDistance = 300000 } = req.query; // Default max distance of 300 km if not provided

    if (!lng || !lat) {
        return res.status(400).json({
            "message": "Longitude and latitude query parameters are required"
        });
    }

    try {
        const point = {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
        };

        const geoOptions = {
            distanceField: "distance.calculated",
            key: "coords",
            spherical: true,
            maxDistance: parseFloat(maxDistance)
        };

        const results = await Loc.aggregate([
            {
                $geoNear: {
                    near: point,
                    ...geoOptions
                }
            }
        ]);

        // Map over results to convert distance to kilometers and shape response
        const locations = results.map(result => ({
            _id: result._id,
            name: result.name,
            address: result.address,
            facilities: result.facilities,
            distance: `${meterToKilometer(result.distance.calculated).toFixed(2)} km`
        }));

        res.status(200).json(locations);
    } catch (err) {
        console.error("Error in locationsListByDistance:", err);
        return res.status(500).json({ message: "Internal server error" }); // JSON response for 500 errors
    }
};

// Create a new location
const locationsCreate = async (req, res) => {
    const {
        name,
        address,
        facilities,
        lng,
        lat,
        days1,
        opening1,
        closing1,
        closed1,
        days2,
        opening2,
        closing2,
        closed2
    } = req.body;

    // Log the received request body to debug
    console.log("Received request body:", req.body);

    // Validate that required fields are provided
    if (!name || !lng || !lat || !facilities) {
        return res.status(400).json({
            "message": "Name, longitude, latitude, and facilities are required"
        });
    }

    try {
        const location = await Loc.create({
            name,
            address,
            facilities: facilities.split(","), // Split facilities into array
            coords: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            openingTimes: [
                {
                    days: days1,
                    opening: opening1,
                    closing: closing1,
                    closed: closed1
                },
                {
                    days: days2,
                    opening: opening2,
                    closing: closing2,
                    closed: closed2
                }
            ]
        });
        return res.status(201).json(location);
    } catch (err) {
        console.error("Error in locationsCreate:", err);
        return res.status(500).json({ message: "Internal server error" }); // JSON response for 500 errors
    }
};

// Delete a location by ID
const locationsDeleteOne = async (req, res) => {
    const { locationid } = req.params;

    if (!locationid) {
        return showError(req, res, 404); // Use showError for missing ID
    }

    try {
        const location = await Loc.findByIdAndRemove(locationid).exec();

        if (!location) {
            return showError(req, res, 404); // Use showError for not found
        }

        return res.status(204).json(null);
    } catch (err) {
        console.error("Error deleting location:", err);
        return res.status(500).json({ message: "Internal server error" }); // JSON response for 500 errors
    }
};

// Read a specific location by ID
const locationsReadOne = async (req, res) => {
    const { locationid } = req.params;

    if (!locationid) {
        return showError(req, res, 404); // Use showError for missing ID
    }

    try {
        const location = await Loc.findById(locationid).exec();

        if (!location) {
            return showError(req, res, 404); // Handle not found case
        }

        res.status(200).json(location);
    } catch (err) {
        console.error("Error reading location:", err);
        return showError(req, res, 500); // Handle server error
    }
};



// Update a specific location by ID
const locationsUpdateOne = async (req, res) => {
    const { locationid } = req.params;

    if (!locationid) {
        return showError(req, res, 404); // Use showError for missing ID
    }

    try {
        const updatedLocation = await Loc.findByIdAndUpdate(locationid, req.body, { new: true }).exec();

        if (!updatedLocation) {
            return showError(req, res, 404); // Use showError for not found
        }

        res.status(200).json(updatedLocation);
    } catch (err) {
        console.error("Error updating location:", err);
        return res.status(500).json({ message: "Internal server error" }); // JSON response for 500 errors
    }
};

module.exports = {
    locationsListByDistance,
    locationsCreate,
    locationsReadOne,
    locationsUpdateOne,
    locationsDeleteOne
};
