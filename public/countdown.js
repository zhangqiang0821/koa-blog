var moment = require('moment')

exports.countdown = (date, strFront) => {
  var currTime = new Date().getTime()
  var countdownTime = currTime - date.getTime()
  var second = countdownTime / 1000
  if (second < 60) {
    return `${strFront || ''}1 分钟前`
  } else if (second >= 60 && second < 3600) {
    return `${strFront || ''}${parseInt(second / 60)} 分钟前`
  } else if (second >= 3600 && second < 3600 * 24) {
    return `${strFront || ''}${parseInt(second / 3600)} 小时之前`
  } else if (second >= 3600 * 24) {
    return `${strFront || ''}${parseInt(second / (3600 * 24))} 天之前`
  } else {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
  }
}
