var connect = require('../lib/index')
var log = new require('../public/log.js')()

let comments_sql = `CREATE TABLE IF NOT EXISTS comments(
                  id INT(13) NOT NULL AUTO_INCREMENT,
                  author VARCHAR(150) NOT NULL,
                  article_id INT(13) NOT NULL,
                  content VARCHAR(1000) NOT NULL,
                  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY( id )
                )`

connect.createTable(comments_sql).then(data => {
  console.log('创建评论表成功')
}).catch(err => {
  log.error('创建评论表错误', JSON.stringify(err))
})

let addComment = (values) => {
  sql = `insert into comments
         set author = ?,
         article_id = ?,
         content = ?,
         create_time = ?,
         update_time = ?`
  return connect.query(sql, values)
}

let findComments = (articleId) => {
  sql = `SELECT
        	users.avatar,
        	users.username,
          users.source,
        	comments.*
        FROM
        	comments
        	INNER JOIN users ON users.sourceId = comments.author
        WHERE
        	article_id = ${articleId}
          order by comments.create_time desc`
  return connect.query(sql, [])
}

module.exports = {
  addComment,
  findComments
}
