var path = require('path')
var fs = require('fs')
var Router = require('koa-router')
var articleModel = require('../model/articles')
var countdown = require('../public/countdown.js').countdown

var router = new Router({
  prefix: '/'
})

router.get('/', async ctx => {
  let articleList = await articleModel.findArticlesList(0, 10).then(data => {
    return data
  })
  let articleListFormat = await articleList.map(article => {
    return Object.assign({
      countdown: countdown(article.update_time, '更新于 ')
    }, article)
  })
  return ctx.render('index', {
    articles: articleListFormat
  })
}).post('/', async ctx => {
  console.log(ctx.request.body)
})

module.exports = router.routes()
