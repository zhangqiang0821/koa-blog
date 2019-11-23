module.exports = function (app) {
  app.use(require('./index.js'))
  app.use(require('./signin.js'))
  app.use(require('./signup.js'))
  app.use(require('./updateUser.js'))
  app.use(require('./article.js'))
  app.use(require('./comment.js'))
  app.use(require('./like.js'))
}
