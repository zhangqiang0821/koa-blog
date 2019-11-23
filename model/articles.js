var connect = require('../lib/index')
var log = new require('../public/log.js')()

/**
  @property {Char} type 文章类型 1：原创; 2：转载; 3：翻译
*/
let articles_sql = `CREATE TABLE IF NOT EXISTS articles(
                  id INT(13) NOT NULL AUTO_INCREMENT,
                  tag VARCHAR(100),
                  abstract VARCHAR(1024),
                  title VARCHAR(100),
                  content TEXT,
                  type VARCHAR(1),
                  author VARCHAR(150),
                  picture  VARCHAR(1024),
                  pv INT,
                  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY( id )
                )`

connect.createTable(articles_sql).then((data) => {
  console.log('创建文章表成功')
}).catch((err) => {
  log.error('创建文章表错误', JSON.stringify(err))
})

let addArticles = (values) => {
  let sql = `insert into articles set
             title = ?,
             tag = ?,
             abstract = ?,
             content = ?,
             type = ?,
             author = ?,
             picture = ?,
             pv = ?,
             create_time = ?,
             update_time = ?`
  return connect.query(sql, values)
}

let findArticles = () => {
  let sql = `select * from articles`
  return connect.query(sql, [])
}

let findArticleById = (id) => {
  let sql = `select users.username, users.avatar, users.sign, users.source, articles.*
             from articles
             inner join users
             on articles.author = users.sourceId
             where articles.id = ${id}`
  return connect.query(sql, [])
}

let findArticlesByAuthor = (author) => {
  let sql = `SELECT
          	articles.id,
          	articles.tag,
          	articles.abstract,
          	articles.title,
          	articles.content,
          	articles.type,
          	articles.author,
          	articles.picture,
          	articles.pv,
          	articles.create_time,
          	articles.update_time,
          	Count( likes.id ) AS likes
          FROM
          	articles
          	LEFT JOIN likes ON articles.id = likes.article_id
          WHERE
          	articles.author = '${author}'
          GROUP BY(articles.id)
          ORDER BY
          	articles.update_time DESC`
  return connect.query(sql, [])
}

let findArticlesList = (startRow, rowCount) => {
  let sql = `SELECT
            	users.username,
            	users.avatar,
            	users.source,
            	users.sign,
            	articles.*,
            	Count(likes.id) as likes
            FROM
            	articles
            	INNER JOIN users ON articles.author = users.sourceId
            	left JOIN likes ON articles.id = likes.article_id
            GROUP BY
            	( articles.id )
            ORDER BY
            	articles.update_time DESC
            LIMIT ${startRow}, ${rowCount}`
  return connect.query(sql, [])
}

let updatePv = (articleId) => {
  let sql = `update articles
             set pv = pv + 1
             where
            	 id = ${articleId}`
  return connect.query(sql, [])
}

let updateArticleById = (articleId, values) => {
  let sql = `update articles set
             title = ?,
             tag = ?,
             abstract = ?,
             content = ?,
             type = ?,
             picture = ?,
             update_time = ?
             where id = ${articleId}`
  return connect.query(sql, values)
}

let deleteArticleById = (articleId) => {
  let sql = `delete from articles where id = ${articleId}`
  return connect.query(sql, [])
}

module.exports = {
  addArticles,
  findArticles,
  findArticleById,
  findArticlesByAuthor,
  findArticlesList,
  deleteArticleById,
  updatePv,
  updateArticleById
}
