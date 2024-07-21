// models/url.js

const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  ShortId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["URL", "Whatsapp", "Location", "Email", "Text", "WiFi"],
  },
  shortDescription: {
    type: String,
    required: true,
  },
  redirectURL: {
    type: String,
    required: true,
    unique: true,
  },
  qrCodeURL: {
    type: String,
    required: true,
  },
  visitedHistroy: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  activationDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    default: () => Date.now() + 2 * 60 * 1000, // 2 min from now
  },
  isInactive: {
    type: Boolean,
    default: false,
  },
});

const URL = mongoose.model("URL", urlSchema);

module.exports = URL;
