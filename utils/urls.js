// This function sets up the ability to allow a user to set the url for the email handler.
exports.setUrl = (request, route, params) => {
  return `${request.protocol}://${request.headers.host}/${route}/${params}`;
};
