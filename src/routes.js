const router = require('express').Router()
const controller = require('./controllers/product.controller')

router
    //
    .post("/", controller.create)
    .get("/", controller.fetchAll)
    .patch("/:id", controller.criterias)
    .put("/:id", controller.unAuthorized)
    .delete("/:id", controller.unAuthorized)

module.exports = router;