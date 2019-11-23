var moment = require('moment')
var Router = require('koa-router')
var md = require('markdown-it')()
var articleModel = require('../model/articles')
var commentModel = require('../model/comments')
var replyModel = require('../model/replys')
var likeModel = require('../model/likes')
var saveBase64 = require('../public/saveBase64').save
var log = new require('../public/log.js')()
var countdown = require('../public/countdown.js').countdown
var checkLogin = require('../middlewares/checkLogin.js')
var router = new Router({
  prefix: '/article'
})

router
  .get('/create', async ctx => {
    // let userInfo = ctx.session.userInfo
    return ctx.render('create')
  })
  .post('/addArticles', async ctx => {
    try {
      if (!ctx.request.body.content) {
        throw new Error('文章内容不能为空')
      }
      if (!ctx.request.body.title) {
        throw new Error('文章标题不能为空')
      }
      if (!ctx.request.body.content) {
        throw new Error('文章类型不能为空')
      }
    } catch (e) {
      ctx.body = {
        code: -1,
        data: {},
        msg: e.message
      }
    }

    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    let picture = await saveBase64(ctx.request.body.picture).then(imgName => {
      return imgName
    })
    let args = [
      ctx.request.body.title,
      ctx.request.body.tag || null,
      ctx.request.body.abstract || null,
      ctx.request.body.content,
      ctx.request.body.type,
      ctx.session.userInfo.sourceId,
      picture || null,
      1,
      time,
      time
    ]
    let createSuccess = await articleModel.addArticles(args).then(data => {
      ctx.body = {
        code: data ? 1 : -1,
        data: {},
        msg: data ? '创建文章成功' : '创建文章失败，请重试'
      }
    }).catch(err => {
      log.error('创建文章失败', JSON.stringify(err))
      return false
    })
  })
  .get('/:articleId', async ctx => {
    // 先更新 pv再查询文章
    let articleData = await Promise.all([
      articleModel.updatePv(ctx.params.articleId),
      articleModel.findArticleById(ctx.params.articleId),
      commentModel.findComments(ctx.params.articleId),
      replyModel.findReplyByArticleId(ctx.params.articleId),
      likeModel.findUserByArticleId(ctx.params.articleId),
      likeModel.findCountByArticleId(ctx.params.articleId)
    ]).then(data => {
      try {
        if (!data[1].length) {
          throw new error('未查询到该文章')
        }
        if (data[3].length) {
          data[2].forEach((comment) => {
            comment.replys = []
            data[3].forEach((reply) => {
              if (reply.comment_id === comment.id) {
                comment.replys.push(Object.assign(reply, {
                  create_time: countdown(reply.create_time)
                }))
              }
            })
          })
        }
        // 评论内容
        data[1][0].comments = data[2] || []
        // 判断用户是点赞还是去掉点赞
        data[1][0].allowLike = !data[4].length ? true : false
        // 当前文章总点赞数
        data[1][0].likes = data[5][0].likes

        return data[1][0]
      } catch (err) {
        log.error('更新', err.message)
      }
    }).catch(err => {
      log.error('查询文章或更新pv错误', JSON.stringify(err))
    })

    // 当用户处于已登录状态时，判断用户是否已为这篇文章点赞
    if (ctx.session.userInfo) {
      let find = await likeModel.findLikeByAuthor(ctx.session.userInfo.sourceId, ctx.params.articleId).then(data => {
        return data.length ? false : true
      })
      articleData.allowLike = find
    }

    articleData.comments.forEach((comment, index) => {
      comment.countdown = countdown(comment.create_time)
    })
    return ctx.render('article', {
      article: Object.assign({}, articleData, {
        update_time: moment(articleData.update_time).format('YYYY-MM-DD HH-mm'),
        content: md.render(articleData.content)
      })
    })
  })
  .get('/author/:username', async ctx => {
    let articles = await articleModel.findArticlesByAuthor(ctx.session.userInfo.sourceId).then(articles => {
      return articles
    }).catch(err => {
      log.error('查询用户文章错误', JSON.stringify(err))
    })

    // 该用户的文章统计数据
    let staticties = {
      articleType1: 0,
      articleType2: 0,
      articleType3: 0,
      pvCount: 0,
      articleCount: articles.length,
      likeCount: 0
    }

    articles.forEach((article) => {
      Object.assign(article, {countdown: countdown(article.update_time, '更新于 ')})
      if (article.type === '1') {
        staticties.articleType1 ++
      } else if (article.type === '2') {
        staticties.articleType2 ++
      } else if (article.type === '3') {
        staticties.articleType3 ++
      }
      staticties.pvCount += article.pv
      staticties.likeCount += article.likes
    })
    return ctx.render('person', {
      articles,
      staticties
    })
  })
  .get('/:articleId/edit', async ctx => {
    let articleData = await articleModel.findArticleById(ctx.params.articleId).then(data => {
      if (data.length) {
        return data[0]
      } else {
        log.error('未找到该ID的文章', ctx.params.articleId)
      }
    }).catch(err => {
      log.error('查询文章失败', JSON.stringify(err))
    })
    return ctx.render('editArticle', {article: articleData})
  })
  .post('/:articleId/edit', checkLogin, async ctx => {
    let article = await articleModel.findArticleById(ctx.params.articleId).then(data => {
      if (data.length) {
        return data[0]
      } else {
        return false
      }
    })
    if (!article) {
      return ctx.body = {
        code: -1,
        data: {},
        msg: '此文章不存在'
      }
    }
    if (article.author !== ctx.session.userInfo.sourceId) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '您没有权限修改此文章'
      }
    } else {
      try {
        if (!ctx.request.body.content) {
          throw new Error('文章内容不能为空')
        }
        if (!ctx.request.body.title) {
          throw new Error('文章标题不能为空')
        }
        if (!ctx.request.body.content) {
          throw new Error('文章类型不能为空')
        }
      } catch (e) {
        ctx.body = {
          code: -1,
          data: {},
          msg: e.message
        }
      }
      let time = moment().format('YYYY-MM-DD HH:mm:ss')
      let picture = ctx.request.body.picture.replace(/\/img\//, '')
      if (picture !== article.picture) {
        picture = await saveBase64(ctx.request.body.picture).then(imgName => {
          return imgName
        })
      }
      let update = await articleModel.updateArticleById(ctx.params.articleId, [
        ctx.request.body.title,
        ctx.request.body.tag || null,
        ctx.request.body.abstract || null,
        ctx.request.body.content,
        ctx.request.body.type,
        picture || null,
        time
      ]).then(data => {
        return data ? true : false
      }).catch(err => {
        log.error('更新文章失败', JSON.stringify(err))
      })
      ctx.body = {
        code: update ? 1 : -1,
        data: {},
        msg: update ? '更新文章成功' : '更新失败，请重试'
      }
    }
  })
  .get('/:articleId/delete', checkLogin, async ctx => {
    try {
      let verifyUser = await articleModel.findArticleById(ctx.params.articleId).then(user => {
        if (user.length) {
          return user[0]
        } else {
          throw new error('未找到该文章')
        }
      })
      if (verifyUser.author === ctx.session.userInfo.sourceId) {
        let deleteStep = await articleModel.deleteArticleById(ctx.params.articleId).then(data => {
          return data
        }).catch(err => {
          log.error('删除文章失败', JSON.stringify(err))
          throw new error(`删除文章失败${JSON.stringify(err)}`)
        })
        ctx.body = {
          code: 1,
          data: {},
          msg: '删除成功'
        }
      } else {
        throw new error('你没有权限删除此文章')
      }
    } catch (e) {
      ctx.body = {
        code: -1,
        data: {},
        msg: e.message
      }
    }
  })

module.exports = router.routes()
