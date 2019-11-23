var connect = require('../lib/index')
var log = new require('../public/log.js')()

let comments_sql = `CREATE TABLE IF NOT EXISTS replys(
                  id INT(13) NOT NULL AUTO_INCREMENT,
                  author VARCHAR(150) NOT NULL,
                  article_id INT(13) NOT NULL,
                  comment_id INT(13) NOT NULL,
                  content VARCHAR(1000) NOT NULL,
                  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY( id )
                )`

connect.createTable(comments_sql).then(data => {
  console.log('创建回复表成功')
}).catch(err => {
  log.error('创建回复表错误', JSON.stringify(err))
})

let addReply = (values) => {
  let sql = `INSERT INTO replys
            SET author = ?,
            article_id = ?,
            comment_id = ?,
            content = ?,
            create_time = ?,
            update_time = ?`
  return connect.query(sql, values)
}

let findReplyByArticleId = (articleId) => {
  let sql = `SELECT
            	users.*, replys.*
            FROM
            	replys
            	INNER JOIN users ON users.sourceId = replys.author
            WHERE
            	article_id = ${articleId}`
  return connect.query(sql, [])
}

module.exports = {
  addReply,
  findReplyByArticleId
}
