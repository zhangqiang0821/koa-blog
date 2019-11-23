module.exports = async (ctx, next) => {
  if(ctx.session.userInfo) {
    await next()
  } else {
    ctx.body = {
      code: -1,
      data: {},
      msg: '用户未登录'
    }
  }
}
