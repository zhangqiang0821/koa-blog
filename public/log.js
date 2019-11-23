var fs = require('fs')
var path = require('path')

function Logger () {
  let pathStr = path.join(__dirname, '../log/log.txt')

  function error () {
    let argv = Array.from(arguments)
    let errStr = argv.slice(1).join(`---\n---`)
    fs.access(path.join(__dirname, '../log'), err => {
      if (err) {
        console.log('将自动创建log目录')
        fs.mkdir(path.join(__dirname, '../log'), err => {
          if (err) {
            console.log('创建log目录失败')
            return ;
          }
          fs.appendFile(pathStr, `${arguments[0]}[${String(new Date())}]\n---${errStr}---\n\n`, 'utf8', () => {
            console.log('已打印错误入日志文件')
          })
        })
        return ;
      }
      fs.appendFile(pathStr, `${arguments[0]}[${String(new Date())}]\n---${errStr}---\n\n`, 'utf8', () => {
        console.log('已打印错误入日志文件')
      })
    })
  }

  return {
    error: error
  }
}

module.exports = Logger
