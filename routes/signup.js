var path = require('path')
var fs = require('fs')
var Router = require('koa-router')
var userModel = require('../model/users.js')
var md5 = require('md5')
var moment = require('moment')
var log = new require('../public/log.js')()

var router = new Router({
  prefix: '/signup'
})

router
  .get('/', async ctx => {
    ctx.state.app.status = ctx.session.status
    ctx.state.app.msg = ctx.session.msg
    return ctx.render('signup')
  })
  .post('/', async ctx => {
    try {
      if (!(ctx.request.body.username.length >= 1 && ctx.request.body.username.length <= 10)) {
        throw new Error('名字请限制在1-10个字符之间')
      }
      if (ctx.request.body.password.length < 6) {
        throw new Error('密码至少6个字符');
      }

      if (ctx.request.body.password !== ctx.request.body.repassword) {
        throw new Error('两次密码输入不一致')
      }

      if ((['1', '2', '3'].indexOf(ctx.request.body.gender)) !== -1) {
        throw new Error('请选择正确的性别')
      }

    } catch (e) {
      ctx.body = {
        code: -1,
        data: {},
        msg: e.message
      }
    }
    await userModel.findUserByName(ctx.request.body.username).then(async data => {
      // 检测用户名是否存在
      if (data.length) {
        ctx.body = {
          code: -1,
          data: {},
          msg: '用户名已存在'
        }
      } else {
        let base64Data = ctx.request.body.avatar.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = new Buffer(base64Data, 'base64')
        let avatarName = `${moment().format('YYYY-MM-DD-HH-mm-ss-SS')}.png`
        let uploadAvatar = await new Promise((resolve, reject) => {
          fs.writeFile(path.join(__dirname, `../static/img/${avatarName}`), dataBuffer, err => {
            if (err) {
              throw new Error(err);
              reject(false)
            }
            resolve(true)
          })
        })
        if (!uploadAvatar) {
          ctx.body = {
            code: -1,
            data: {},
            msg: '头像上传失败'
          }
          return 0
        }

        // 添加用户信息
        let nativeId = `native${(new Date()).getTime()}`
        let isSuccess = await userModel.addUser([
          nativeId,
          ctx.request.body.username,
          md5(ctx.request.body.password),
          parseInt(ctx.request.body.gender),
          `${avatarName}`,
          ctx.request.body.sign,
          'native',
          moment().format('YYYY-MM-DD HH:mm:ss'),
          moment().format('YYYY-MM-DD HH:mm:ss')
        ]).then(result => {
          delete ctx.request.body.password
          if(result) {
            ctx.session.userInfo = {
              username: ctx.request.body.username,
              avatar: `${avatarName}`,
              sourceId: nativeId,
              source: 'native'
            }
            ctx.body = {
              code: 1,
              data: ctx.session.userInfo,
              msg: '注册成功'
            }
          } else {
            ctx.body = {
              code: -1,
              data: {},
              msg: '注册用户失败'
            }
          }
        }).catch(err => {
          log.error('插入用户失败', JSON.stringify(err))
          return false
        })
      }
    }).catch((err) => {
      log.error('查询用户信息错误', JSON.stringify(err))
    })
  })
  .post('/findUser', async ctx => {
    await userModel.findUserByName(ctx.request.body.username).then(async data => {
      // 检测用户名是否存在
      if (data.length) {
        ctx.body = {
          code: 1,
          data: {},
          msg: '用户名已存在'
        }
      } else {
        // 添加用户信息
        ctx.body = {
          code: -1,
          data: {},
          msg: '用户名不存在'
        }
      }
    }).catch((err) => {
      log.error('查询用户信息错误', JSON.stringify(err))
    })
  })

module.exports = router.routes()
