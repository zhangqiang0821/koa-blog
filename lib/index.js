var mysql = require('mysql')
var config = require('../config/default.js')
var log = new require('../public/log.js')()

var pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  port: config.database.PORT
})

let query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, (error, results, fields) => {
          if (error) {
            reject (error)
          } else {
            resolve(results)
          }
          connection.release()
        })
      }
    })
  })
}

let createTable = sql => {
  return query(sql, [])
}

module.exports = {
  query: query,
  createTable: createTable
}
