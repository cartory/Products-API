const request = require("supertest")

const app = require("../src/app")
const products = require("./products.json")
const Product = require("../src/models/product")

describe("Products API", () => {
	beforeEach(async () => await Product.sync({ logging: false, force: true }))

	test("should create a new product", async () => {
		const { statusCode, body } = await request(app).post("/products").send(products[0])
		delete body.id

		expect(statusCode).toBe(201)
		expect(body.isPublished).toBe(false)
	})

	test("should create a new product without the published field", async () => {
		const { statusCode, body } = await request(app).post("/products").send(products[2])
		delete body.id

		expect(statusCode).toBe(201)
		expect(body.isPublished).toBe(false)
	})

	test("should fetch no products if there are not products stored", async () => {
		const { statusCode, body } = await request(app).get("/products")

		expect(JSON.stringify(body)).toBe("[]")
		expect(statusCode).toBe(200)
	})

	test("should fetch all the products", async () => {
		const results = await Product.bulkCreate(products, { logging: false })
		const { statusCode } = await request(app).get("/products")

		expect(statusCode).toBe(200)
		expect(results.length).toBe(products.length)
	})

	test("should publish the product if all the constraints are met", async () => {
		await Product.bulkCreate(products, { logging: false })
		const { statusCode } = await request(app).patch("/products/1").send({ isPublished: true })

		expect(statusCode).toBe(204)
	})

	test("should publish the product and the data should be updated in the DB", async () => {
		await Product.bulkCreate(products, { logging: false })

		const { statusCode } = await request(app).patch("/products/1").send({ isPublished: true })
		expect(statusCode).toBe(204)

		const { body } = await request(app).get("/products")
		const product = body.find((p) => p.id === 1)

		expect(!product).toBe(false)
		expect(product.isPublished).toBe(true)
	})

	test("should get 422 when MRP is less the price of the content", async () => {
		await Product.bulkCreate(products, { logging: false })
		const { statusCode, body } = await request(app).patch("/products/2").send({ isPublished: true })

		expect(statusCode).toBe(422)
		expect(JSON.stringify(body)).toBe(JSON.stringify(["MRP should be less than equal to the Price"]))
	})

	test("should get 422 when stock of the product is 0", async () => {
		const results = await Product.bulkCreate(products, { logging: false })
		const product = results.find((r) => r.getDataValue("stock") === 0 && r.getDataValue("mrp") === 1.19).toJSON()

		const { statusCode, body } = await request(app).patch(`/products/${product.id}`).send({ isPublished: true })

		expect(statusCode).toBe(422)
		expect(JSON.stringify(body)).toBe('["Stock count is 0"]')
	})

	test("should get 422 when both MRP is less the price of the product and stock of the product is 0", async () => {
		const results = await Product.bulkCreate(products, { logging: false })
		const product = results.find((r) => r.getDataValue("mrp") == 2.28).toJSON()

		const { statusCode, body } = await request(app).patch(`/products/${product.id}`).send({ isPublished: true })

		expect(statusCode).toBe(422)
		expect(JSON.stringify(body)).toBe(JSON.stringify(["MRP should be less than equal to the Price", "Stock count is 0"]))
	})

	test("should get 405 for a put request to /products/:id", async () => {
		const product = await Product.create(products[0], { logging: false })
		const { statusCode } = await request(app).put(`/products/${product.id}`).send(product)

		expect(statusCode).toBe(405)
	})

	test("should get 405 for a delete request to /products/:id", async () => {
		const product = await Product.create(products[0], { logging: false })
		const { statusCode } = await request(app).delete(`/products/${product.getDataValue("id")}`)
		expect(statusCode).toBe(405)
	})
})
