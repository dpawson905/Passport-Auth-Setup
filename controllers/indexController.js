exports.indexPage = async (req, res, next) => {
  res.render('index', {
    url: 'home',
    title: 'Thanks for checking it out!',
    userInfo: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
    },
  });
};
