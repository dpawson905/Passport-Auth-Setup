exports.removeFailedUser = (async (User, userEmail) => {
  await User.deleteOne({ email: userEmail });
});