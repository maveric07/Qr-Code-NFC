//controllers/url/js

const { nanoid } = require("nanoid");
const QRCode = require("qrcode");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  const { userId, url, type, shortDescription } = req.body;
  if (!userId || !url || !type || !shortDescription) {
    return res
      .status(400)
      .json({ error: "User ID, URL, type, and shortDescription are required" });
  }

  try {
    // Check if the URL already exists for the user
    let existingUrl = await URL.findOne({ userId, redirectURL: url });

    if (existingUrl) {
      // If the URL exists, return the existing document
      return res.json({
        id: existingUrl.ShortId,
        qrCode: existingUrl.qrCodeURL,
        shortDescription: existingUrl.shortDescription,
      });
    }

    // If the URL does not exist, create a new one
    const ShortID = nanoid(8);
    const qrCodeURL = await QRCode.toDataURL(url);
    const activationDate = new Date();
    const expiryDate = new Date(activationDate.getTime() + 2 * 60 * 1000);

    const newUrl = new URL({
      userId,
      ShortId: ShortID,
      type,
      shortDescription,
      redirectURL: url,
      visitedHistroy: [],
      qrCodeURL: qrCodeURL,
      activationDate,
      expiryDate,
      isInactive: false,
    });

    await newUrl.save();

    return res.json({ id: ShortID, qrCode: qrCodeURL, shortDescription });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleGenerateNewShortURL,
};
