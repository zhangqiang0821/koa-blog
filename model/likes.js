var connect = require('../lib/index')
var log = new require('../public/log.js')()

let likes_sql = `CREATE TABLE IF NOT EXISTS likes(
                  id INT(13) NOT NULL AUTO_INCREMENT,
                  article_id INT(13) NOT NULL,
                  author INT(13),
                  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY( id )
                )`

connect.createTable(likes_sql).then(data => {
  console.log('创建点赞表成功')
}).catch(err => {
  log.error('创建点赞表错误', JSON.stringify(err))
})

let addLike = (values) => {
  let sql = `INSERT INTO likes
            SET article_id = ?,
            author = ?,
            create_time = ?,
            update_time = ?`
  return connect.query(sql, values)
}

let findLikeByAuthor = (author, articleId) => {
  let sql = `SELECT
            	likes.id
            FROM
            	likes
            WHERE
            	author = '${author}'
            	AND article_id = ${articleId}`
  return connect.query(sql, [])
}

let findCountByArticleId = (articleId) => {
  let sql = `SELECT Count(author) as likes
            FROM
            	likes
            WHERE
            	article_id = ${articleId}`
  return connect.query(sql, [])
}

let findUserByArticleId = (articleId) => {
  let sql = `SELECT author
            FROM
            	likes
            WHERE
            	article_id = ${articleId}`
  return connect.query(sql, [])
}

let deleteLikeByArticleId = (articleId) => {
  let sql = `DELETE
            FROM
            	likes
            WHERE
            	article_id = ${articleId}`
  return connect.query(sql, [])
}

module.exports = {
  addLike,
  findLikeByAuthor,
  findCountByArticleId,
  findUserByArticleId,
  deleteLikeByArticleId
}
