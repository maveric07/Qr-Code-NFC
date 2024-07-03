// const mongoose = require("mongoose");

// const urlSchema = new mongoose.Schema({
//   ShortId: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   redirectURL: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   qrCodeURL: {
//     type: String,
//     required: true,
//   },
//   visitedHistroy: [
//     {
//       timestamp: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
// });

// const URL = mongoose.model("URL", urlSchema);

// module.exports = URL;

const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
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
});

const URL = mongoose.model("URL", urlSchema);

module.exports = URL;
