const Product = require("../models/product")

const create = async ({ body }, res) => {
	try {
		const product = await Product.create({ ...body, isPublished: false }, { logging: false })
		return res.status(201).json(product)
	} catch (err) {
		console.error(err)
		return res.status(500).send()
	}
}

const criterias = async ({ body, params }, res) => {
	const { isPublished = true } = body

	try {
		const product = await Product.findByPk(params.id, { logging: false })

		if (!product) {
			return res.status(404).send("product not found")
		}

		const errMessages = []
		const criteria1 = product.getDataValue("mrp") >= product.getDataValue("price")
		const criteria2 = product.getDataValue("stock") > 0

		if (!criteria1) {
			errMessages.push("MRP should be less than equal to the Price")
		}

		if (!criteria2) {
			errMessages.push("Stock count is 0")
		}

		if (errMessages.length) {
			return res.status(422).json(errMessages)
		}

		await product.update({ isPublished }, { logging: false })
		return res.status(204).send()
	} catch (err) {
		console.error(err)
		return res.status(500).send("internal server error")
	}
}

const fetchAll = async (_, res) => {
	try {
		const products = await Product.findAll({ order: [["id", "ASC"]], logging: false })
		return res.status(200).json(products)
	} catch (err) {
		console.error(err)
		return res.status(500).json([])
	}
}

const unAuthorized = (_, res) => res.status(405).send("unAuthorized")

module.exports = {
	create,
	fetchAll,
	criterias,
	unAuthorized,
}
