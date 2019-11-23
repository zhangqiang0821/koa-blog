var bodyParser = require('koa-bodyparser')
const logger = require('../public/log.js')
var log = new logger()

module.exports = [
  async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.response.status = err.statusCode || err.status || 500;
      ctx.response.body = {
        message: err.message
      }
      log.error('server error', err)
    }
  },
  bodyParser({
    jsonLimit: '10mb',
    textLimit: '10mb',
    formLimit: '10mb'
  }),
  // 模板引擎的全局对象设置
  async (ctx, next) => {
    ctx.state.app = {
      session: ctx.session,
      title: 'koa-blog',
      author: 'YOLO-Koa'
    }
    await next()
  }
]
