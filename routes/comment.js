var moment = require('moment')
var Router = require('koa-router')
var commentModel = require('../model/comments')
var replyModel = require('../model/replys')
var checkLogin = require('../middlewares/checkLogin.js')
var log = new require('../public/log.js')()

var router = new Router({
  prefix: '/comment'
})

router
  .post('/', checkLogin, async ctx => {
    ctx.request.body.articleId
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    let add = await commentModel.addComment([
      ctx.session.userInfo.sourceId,
      ctx.request.body.articleId,
      ctx.request.body.comment,
      time,
      time
    ]).then(data => {
      return data ? true : false
    }).catch(err => {
      log.error('添加评论失败', JSON.stringify(err))
    })
    if (add) {
      return ctx.body = {
        code: add ? 1 : -1,
        data: {},
        msg: add ? '添加评论成功' : '添加评论失败，请重试'
      }
    }
  })
  .post('/reply', checkLogin, async ctx => {
    let time = moment().format('YYYY-MM-DD HH-mm')
    let addReply = await replyModel.addReply([
      ctx.request.body.author,
      parseInt(ctx.request.body.articleId),
      parseInt(ctx.request.body.commentId),
      ctx.request.body.content,
      time,
      time
    ]).then(data => {
      return data ? data : false
    }).catch(err => {
      log.error('评论回复失败', JSON.stringify(err))
      return false
    })
    return ctx.body = {
      code: addReply ? 1 : -1,
      data: {},
      msg: addReply ? '评论回复成功' : '评论回复失败'
    }
  })
module.exports = router.routes()
