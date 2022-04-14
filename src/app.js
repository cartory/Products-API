const express = require("express")
const cookieParser = require("cookie-parser")

const router = require("./routes")
const sequelize = require("./sequelize")

sequelize
	.authenticate()
	.then(async () => await sequelize.sync({ logging: true }))
	.catch((error) => console.error(error))

const app = express()

app
	.use(express.json())
	.use(cookieParser())
	.use(express.urlencoded({ extended: false }))

app.use("/", (_, res) => {
	return res.status(300).send("<h1>Products API Medium<h1/>")
})

module.exports = app
