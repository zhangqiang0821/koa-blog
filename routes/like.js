var moment = require('moment')
var Router = require('koa-router')
var likeModel = require('../model/likes')
var checkLogin = require('../middlewares/checkLogin.js')
var log = new require('../public/log.js')()
var router = new Router({
  prefix: '/like'
})

router
  .get('/add', checkLogin, async ctx => {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    // 检测是否已点赞过
    let checkLike = await likeModel.findUserByArticleId(ctx.request.query.articleId).then(data => {
      return data
    })
    if (checkLike.length) {
      return ctx.body = {
        code: -1,
        msg: '你已经对这篇文章点过赞了，不允许重复点赞'
      }
    }
    // 若未点赞，则进行点赞操作
    let add = await likeModel.addLike([
      ctx.request.query.articleId,
      ctx.session.userInfo.sourceId,
      time,
      time
    ])
    let find = await likeModel.findCountByArticleId(ctx.request.query.articleId)
    let likeCount = await Promise.all([add, find]).then(data => {
      if (data[0] && data[1]) {
        return data[1][0].likes
      } else {
        return false
      }
    }).catch(err => {
      log.error('点赞失败', JSON.stringify(err))
      return false
    })
    return ctx.body = {
      code: likeCount ? 1 : -1,
      data: likeCount ? { count: likeCount } : null,
      msg: likeCount ? '点赞成功' : '点赞失败'
    }
  })
  .get('/delete', async ctx => {
    // 检测是否已点赞过
    let checkLike = await likeModel.findUserByArticleId(ctx.request.query.articleId).then(data => {
      return data
    })
    if (!checkLike.length) {
      return ctx.body = {
        code: -1,
        msg: '你还未进行过点赞操作，无法去除点赞哦'
      }
    }
    let remove = await likeModel.deleteLikeByArticleId(ctx.request.query.articleId)
    let find = await likeModel.findCountByArticleId(ctx.request.query.articleId)

    let likeCount = await Promise.all([remove, find]).then(data => {
      if (data[0] && data[1]) {
        return data[1][0].likes
      } else {
        return false
      }
    }).catch(err => {
      log.error('去除点赞失败', JSON.stringify(err))
      return false
    })

    return ctx.body = {
      code: likeCount || likeCount === 0 ? 1 : -1,
      data: likeCount || likeCount === 0 ? { count: likeCount } : null,
      msg: likeCount || likeCount === 0 ? '成功' : '失败'
    }
  })

module.exports = router.routes()
