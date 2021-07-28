const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  url: process.env.CLOUDINARY_URL,
});

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let buf = crypto.randomBytes(16);
    buf = buf.toString("hex");
    let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/gi, "");
    uniqFileName += buf;
    console.log(uniqFileName);
    return {
      folder: process.env.APP_NAME,
      format: "jpeg",
      public_id: uniqFileName,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
