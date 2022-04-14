const morgan = require('morgan')
const express = require('express')
const cookieParser = require('cookie-parser')

const router = require('./routes')
const sequelize = require('./sequelize')

sequelize
    .authenticate()
    .then(async () => sequelize.sync())
    .catch(error => console.error(error))

const app = express()

app
    .use(morgan('dev'))
    .use(express.json())
    .use(cookieParser())
    .use(express.urlencoded({ extended: false }))


app.use('/', (_, res) => {
    return res.status(300).send('<h1>Products API Medium<h1/>')
})

module.exports = app