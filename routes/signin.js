var path = require('path')
var Router = require('koa-router')
var userModel = require('../model/users.js')
var md5 = require('md5')
var moment = require('moment')
var config = require('../config/default.js')
var github_signin = require('../public/github_login.js')
var log = new require('../public/log.js')()

var router = new Router({
  prefix: '/signin'
})

router
  .get('/', async ctx => {
    if (ctx.session.userInfo) {
      ctx.response.redirect('/')
    } else {
      ctx.state.app.status = ctx.session.status
      ctx.state.app.msg = ctx.session.msg
      return ctx.render('signin')
    }
  })
  .post('/', async ctx => {
    let user = await userModel.findUserByName(ctx.request.body.username).then(data => {
      if (data.length) return data[0]
      return false
    })
    if (user && user['username'] === ctx.request.body.username && user['password'] === md5(ctx.request.body.password)) {
      delete user['password']
      ctx.session.userInfo = user
      ctx.response.redirect('/')
    } else {
      ctx.session.status = 2
      ctx.session.msg = '用户名或密码不正确'
      ctx.response.redirect('/signin')
    }
  })
  .get('/github', async ctx => {
    ctx.response.redirect(`https://github.com/login/oauth/authorize?client_id=${config.GITHUB_ID}`)
  })
  .get('/github/oauth', async ctx => {
    let userInfo = await github_signin(ctx.request.query.code, config.GITHUB_ID, config.GITHUB_SECRET).then(userInfo => {
      return userInfo
    }).catch(err => {
      log.error('获取 github 用户信息失败', JSON.stringify(err))
    })

    if (userInfo) {
      // 获取授权信息后，先查询用户在用户表中是否存在，存在则更新表数据并直接返回，否则返回前先将用户入库
      let ouathUser = await userModel.findUserBySourceId(userInfo.id).then((data) => {
        return data
      })
      // 判断是否该用户已授权并入库
      if (ouathUser.length) {
        // 判断 github 用户的用户名是否改变
        if (ouathUser.username === userInfo.login && ouathUser.avatar === userInfo.avatar_url) {
          ctx.session.userInfo = ouathUser[0]
          ctx.response.redirect('/')
        } else {
          // 更新用户表中 github 用户的用户名
          let updateUsername = await userModel.updateGithubUserById(userInfo.login, userInfo.avatar_url, moment().format('YYYY-MM-DD HH:mm:ss'), userInfo.id).then(data => {
            return data ? true : false
          }).catch(err => {
            log.error('更新 github 用户名失败', JSON.stringify(err))
            return false
          })
          if (updateUsername) {
            let user = await userModel.getUserInfoBySourceId(userInfo.id)
            ctx.session.userInfo = user
            ctx.response.redirect('/')
          } else {
            ctx.session.errorMsg = `github 授权后用户信息更新失败，请尝试重新授权`
            ctx.session.status = 2
            ctx.redirect('/signin')
          }
        }
      } else {
        let user = await Promise.all([await userModel.addUser([
          userInfo.id,
          userInfo.login,
          null,
          3,
          userInfo.avatar_url,
          null,
          'github',
          moment().format('YYYY-MM-DD HH:mm:ss'),
          moment().format('YYYY-MM-DD HH:mm:ss')
        ]), await userModel.findUserBySourceId(userInfo.id)]).then(data => {
          return data[1][0]
        }).catch(err => {
          log.error('插入用户失败', JSON.stringify(err))
          ctx.session.errorMsg = `授权失败，请尝试注册用户，原因：${JSON.stringify(err)}`
          return false
        })
        if (user) {
          ctx.session.userInfo = user
          ctx.response.redirect('/')
        } else {
          ctx.session.status = 2
          ctx.redirect('/signin')
        }
      }
    } else {
      ctx.session.status = 2
      ctx.session.msg = '获取 github 用户授权失败'
      ctx.response.redirect('/signin')
    }
  })
  .get('/logout', async ctx => {
    ctx.session.status = 1
    ctx.session.msg = `已注销用户${ctx.session.userInfo.username}`
    ctx.session.userInfo = null
    ctx.response.redirect('/signin')
  })

module.exports = router.routes()
