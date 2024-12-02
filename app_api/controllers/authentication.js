const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.setPassword(req.body.password); // Assuming this is defined on the User schema

        await user.save(); // Replaces the callback-style save
        const token = user.generateJwt(); // Assuming this is defined on the User schema
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: "Error saving user", error: err.message });
    }
};

const login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All fields required" });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Authentication error:", err); // Log the error
            return res.status(500).json({ message: "Authentication error", error: err.message });
        }
        if (user) {
            try {
                const token = user.generateJwt(); // Assuming this is defined on the User schema
                return res.status(200).json({ token });
            } catch (tokenError) {
                console.error("Token generation error:", tokenError); // Log token generation error
                return res.status(500).json({ message: "Token generation error", error: tokenError.message });
            }
        } else {
            console.warn("Invalid credentials:", info); // Log invalid login attempts
            res.status(401).json(info);
        }
    })(req, res);
};

module.exports = {
    register,
    login
};
