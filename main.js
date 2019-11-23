const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const compose = require('koa-compose')
const views = require('koa-views')
const session = require('koa-session')
const logger = require('./public/log.js')
const routes = require('./routes/route.js')
const config = require('./config/default.js')
// 自定义中间件
const middlewares = require('./middlewares')
const app = new Koa()
const log = new logger()

app.keys = ['some secret hurr'];

// 模板配置
app.use(views(path.join(__dirname, 'view'), {
  extension: 'ejs',
  map: {
    html: 'ejs'
  }
}));

// session 配置
const CONFIG = {
  key: 'koa:sess',
  maxAge: 24 * 3600 * 1000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false
}
app.use(session(CONFIG, app))

// 静态资源挂载
app.use(require('koa-static')(path.join(__dirname, 'static')))

// response
// 挂载到所有路由实例上的自定义中间件，暂时用于打印日志
app.use(compose(middlewares))

routes(app)

app.on('error', (err) => {
  log.error('server error', err)
})

app.listen(config.port)
