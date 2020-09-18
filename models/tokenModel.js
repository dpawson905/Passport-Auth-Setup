const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresDateCheck: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600,
  },
});

module.exports = mongoose.model("Token", TokenSchema);