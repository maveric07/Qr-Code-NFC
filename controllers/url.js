// const { nanoid } = require("nanoid");
// const QRCode = require("qrcode");
// const URL = require("../models/url");

// async function handleGenerateNewShortURL(req, res) {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required" });

//   try {
//     // Check if the URL already exists
//     let existingUrl = await URL.findOne({ redirectURL: url });

//     if (existingUrl) {
//       // If the URL exists, return the existing document
//       return res.json({
//         id: existingUrl.ShortId,
//         qrCode: existingUrl.qrCodeURL,
//       });
//     }

//     // If the URL does not exist, create a new one
//     const ShortID = nanoid(8);
//     const qrCodeURL = await QRCode.toDataURL(url);

//     const newUrl = new URL({
//       ShortId: ShortID,
//       redirectURL: url,
//       visitedHistroy: [],
//       qrCodeURL: qrCodeURL,
//     });

//     await newUrl.save();

//     return res.json({ id: ShortID, qrCode: qrCodeURL });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// }

// module.exports = {
//   handleGenerateNewShortURL,
// };

const { nanoid } = require("nanoid");
const QRCode = require("qrcode");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  const { url, type } = req.body;
  if (!url || !type)
    return res.status(400).json({ error: "URL and type are required" });

  try {
    // Check if the URL already exists
    let existingUrl = await URL.findOne({ redirectURL: url });

    if (existingUrl) {
      // If the URL exists, return the existing document
      return res.json({
        id: existingUrl.ShortId,
        qrCode: existingUrl.qrCodeURL,
      });
    }

    // If the URL does not exist, create a new one
    const ShortID = nanoid(8);
    const qrCodeURL = await QRCode.toDataURL(url);

    const newUrl = new URL({
      ShortId: ShortID,
      type: type,
      redirectURL: url,
      visitedHistroy: [],
      qrCodeURL: qrCodeURL,
    });

    await newUrl.save();

    return res.json({ id: ShortID, qrCode: qrCodeURL });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleGenerateNewShortURL,
};
