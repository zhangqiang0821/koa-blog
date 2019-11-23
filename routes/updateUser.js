var path = require('path')
var fs = require('fs')
var Router = require('koa-router')
var userModel = require('../model/users.js')
var md5 = require('md5')
var moment = require('moment')
var log = new require('../public/log.js')()

var router = new Router({
  prefix: '/updateUser'
})

router
  .get('/', async ctx => {
    let userInfo = await userModel.getUserInfoBySourceId(ctx.session.userInfo.sourceId)
    ctx.session.userInfo = userInfo
    return ctx.render('updateUserInfo', {
      userInfo: userInfo
    })
  })
  .post('/userInfo', async ctx => {
    let userInfo = JSON.parse(JSON.stringify(ctx.request.body))
    if (ctx.session.userInfo.source === 'native') {
      try {
        if (!(userInfo.username.length >= 1 && userInfo.username.length <= 10)) {
          throw new Error('名字请限制在1-10个字符之间')
        }

        if ((['1', '2', '3'].indexOf(userInfo.gender)) === -1) {
          throw new Error('请选择正确的性别')
        }

        let base64Data = userInfo.avatar.replace(/^data:image\/\w+;base64,/, "");
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

        if (uploadAvatar) {
          userInfo.avatar = avatarName
        } else {
          throw new Error('图片上传失败，请重试');
        }

      } catch (e) {
        ctx.body = {
          code: -1,
          data: {},
          msg: e.message
        }
        return 0
      }
    }

    // 过滤出符合用户表的数据结构
    userInfo.gender = parseInt(userInfo.gender)
    userInfo.sourceId = ctx.session.userInfo.sourceId
    userInfo.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
    let update = userModel.updateUserInfoById(userInfo, ctx.session.userInfo.source).then(data => {
      return data ? true : false
    }).catch(err => {
      log.error('用户信息更新失败', JSON.stringify(err))
    })
    ctx.body = {
      code: update ? 1 : -1,
      data: {},
      msg: update ? '信息更新成功' : '信息更新失败，请尝试重试或联系客服'
    }
  })
  .post('/updatePassword', async ctx => {
    let update = await userModel.updatePasswordById(md5(ctx.request.body.password), ctx.session.userInfo.sourceId).then(data => {
      return data ? true : false
    })
    ctx.body = {
      code: update ? 1 : -1,
      data: {},
      msg: update ? '密码修改成功' : '密码修改失败，请尝试重新修改'
    }
  })

module.exports = router.routes()
