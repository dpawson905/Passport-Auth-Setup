const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const randomstring = require("random-string-gen");

exports.removeFailedUser = (async (User, userEmail) => {
  await User.deleteOne({ email: userEmail });
});

exports.sendText = async(phoneNumber) => {
  let textcode = randomstring({
    length: 6,
    type: 'numeric'
  });
  await client.messages
    .create({
      body: `Thanks for registering, here is your verification code: ${textcode}`,
      from: process.env.TWILIO_NUMBER,
      to: phoneNumber
    })
    .then(message => { return message });
}