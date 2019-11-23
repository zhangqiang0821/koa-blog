var qs = require('querystring')
var request = require('request');

module.exports = (code, client_id, client_secret) => {
  return new Promise((resolve, reject) => {
    request.get({
      url: `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`,
    }, (err, res, body) => {
      console.log(body)
      token = qs.parse(body).access_token
      resolve(token)
    })
  }).then((token) => {
    return new Promise((resolve, reject) => {
      request.get({
        url: `https://api.github.com/user?access_token=${token}`,
        headers: {
          'User-Agent': 'Awesome-Octocat-App'
        }
      }, (err, res, body) => {
        resolve(JSON.parse(body))
      })
    })
  })
}
