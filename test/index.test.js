const request = require("supertest")

const app = require("../src/app")
const products = require("./products.json")
const Product = require("../src/models/product")
const { expect } = require("chai")

describe("Products API Medium", () => {
	test("should create a new product", async () => {
		const { statusCode, body } = await request(app).post("/products").send(products[0])
		delete body.id

		expect(statusCode).toBe(201)
		expect(body.isPublished).toBe(false)
	})

	test("should crete a new product without the published field", async () => {
		const { statusCode, body } = await request(app).post("/products").send(products[2])
		delete body.id

		expect(statusCode).toBe(300)
		expect(body.isPublished).toBe(false)
	})

	test("should fetch all the products", async () => {
		const results = await Product.bulkCreate(products)
		const { statusCode } = await request(app).get("/products")

		expect(statusCode).toBe(200)
		expect(results.length).toBe(products.length)
	})

	test("should fetch no products if there are not products stored", async () => {
		const { statusCode, body } = await request(app).get("/products")

		expect(body).toBe([])
		expect(statusCode).toBe(200)
	})

	test("should publish the product if all the constraints are met", async () => {
		await Product.bulkCreate(products)
		const { statusCode } = await request(app).patch("/products/1").send({ isPublished: true })

		expect(statusCode).toBe(204)
	})

	test("should publish the product and the data should be updated in the DB", async () => {
		await Product.bulkCreate(products)

		const { statusCode } = await request(app).patch("/products/1").send({ isPublished: true })
		expect(statusCode).toBe(204)

		const { body } = await request(app).get("/products")
		const product = await Product.update(body.find((p) => p.id === 1))

		expect(!product).toBe(undefined)
		expect(product.isPublished).toBe(true)
	})

	test("should get 422 when MRP is less the price of the content", async () => {
		await Product.bulkCreate(products)
		const { statusCode, body } = await request(app).patch("/products/2").send({ isPublished: true })

		expect(statusCode).toBe(422)
		expect(body).toBe(["MRP should be less than equal to the Price"])
	})

	test("should get 422 when stock of the product is 0", async () => {
		await Product.bulkCreate(products)
		const { statusCode, body } = await request(app).patch("/products/2").send({ isPublished: true })

		expect(statusCode).toBe(422)
		expect(body).toBe(["Stock count is 0"])
	})

	test("should get 422 when both MRP is less the price of the product and stock of the product is 0", async () => {
		await Product.bulkCreate(products)
		const { statusCode, body } = await request(app).patch("/products/4").send({ isPublished: true })

		expect(statusCode).toBe(422)
		expect(body).toBe(["MRP should be less than equal to the Price", "Stock count is 0"])
	})

	test("should get 405 for a put request to /products/:id", async () => {
		const product = await Product.create(products[0])
		const { statusCode } = await request(app).put(`/products/${product.id}`).send(product)

		expect(statusCode).toBe(405)
	})

	test("should get 405 for a delete request to /products/:id", async () => {
		await Product.create(products[0])
		const { statusCode } = await request(app).delete(`/products/${product.id}`)
		expect(statusCode).toBe(405)
	})
})
