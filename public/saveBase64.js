var path = require('path')
var fs = require('fs')

exports.save = async (base64) => {
  if (base64) {
    let base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = new Buffer(base64Data, 'base64')
    let imgName = `title-${(new Date()).getTime()}.png`
    let saveFile = await new Promise((resolve, reject) => {
      fs.writeFile(path.join(__dirname, `../static/img/${imgName}`), dataBuffer, err => {
        if (err) {
          throw new Error(err);
          reject(false)
        }
        resolve(imgName)
      })
    })
    return saveFile
  } else {
    return null
  }
}
