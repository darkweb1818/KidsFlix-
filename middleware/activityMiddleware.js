const User = require("../models/User");

// middleware/activityMiddleware.js
module.exports = async (req, res, next) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
  }
  next();
};

