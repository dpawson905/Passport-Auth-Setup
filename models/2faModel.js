const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _2faSchema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  _2faToken: {
    type: String,
    required: true,
  },
  expiresDateCheck: {
    type: Date,
    default: undefined,
    // if user is not verified then the account will be removed in 24 hours
    expires: 2592000,
  },
});

module.exports = mongoose.model("2faToken", _2faSchema);
