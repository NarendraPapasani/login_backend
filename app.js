const express = require('express')
const {open} = require('sqlite')
const sq3 = require('sqlite3')
const path = require('path')
const mypath = path.join(__dirname, 'userData.db')
const bcrypt = require('bcrypt')
const app = express()
app.use(express.json())
let db = null

const initDB = async () => {
  try {
    db = open({
      filename: mypath,
      driver: sq3.Database,
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

initDB()
app.listen(3000)

//register
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hassesPass = await bcrypt.hash(password, 10)
  const confirmuserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const res = await db.get(confirmuserQuery)
  if (password.length < 5) {
    response.status(400)
    response.send('Password is too short')
  } else if (res === undefined) {
    const usercreateQuery = `INSERT INTO user (username,name,password,gender,location) VALUES('${username}','${name}','${hassesPass}','${gender}','${location}')`
    await db.run(usercreateQuery)
    response.status(200)
    response.send('User created successfully')
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

//login
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const confirmuserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const res = await db.get(confirmuserQuery)
  const decrypt = await bcrypt.compare(password, res.password)
  if (res === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else if (decrypt === false) {
    response.status(400)
    response.send('Invalid password')
  } else {
    response.status(200)
    response.send('Login success!')
  }
})

//change-password
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const compareold = await bcrypt.compare(oldPassword, res.password)
  const newstore = await bcrypt.hash(newPassword, 10)
  if (newPassword.length < 5) {
    response.status(400)
    response.send('Password is too short')
  } else if (compareold === false) {
    response.status(400)
    response.send('Invalid current password')
  } else {
    const quer = `UPDATE user SET password = '${newstore}' WHERE username = '${username}'`
    response.status(200)
    response.send('Password updated')
  }
})
module.exports = app
