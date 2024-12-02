const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');
const ctrlReviews = require('../controllers/reviews');
const ctrlAuth = require('../controllers/authentication');
const { expressjwt: jwt } = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'], // default algorithm
    // userProperty: 'payload'
    userProperty: 'req.auth'
});

// Location routes
router
    .route('/locations')
    .get(ctrlLocations.locationsListByDistance)
    .post(ctrlLocations.locationsCreate);

router
    .route('/locations/:locationid')
    .get(ctrlLocations.locationsReadOne)
    .put(ctrlLocations.locationsUpdateOne)
    .delete(ctrlLocations.locationsDeleteOne);

// Review routes
router.route('/locations/:locationid/reviews')
    .post(auth, ctrlReviews.reviewsCreate);


router
    .route('/locations/:locationid/reviews/:reviewid')
    .get(ctrlReviews.reviewsReadOne)
    .put(auth, ctrlReviews.reviewsUpdateOne)      // Added update route for reviews
    .delete(auth, ctrlReviews.reviewsDeleteOne);  // Added delete route for reviews

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
