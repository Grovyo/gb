const express = require("express");
const router = express.Router();

const { create, status } = require("../controllers/order");

router.post("/neworder/:userId/:productId", create);
router.patch("/orderstatus/:userId/:productId/:orderId", status);

module.exports = router;
