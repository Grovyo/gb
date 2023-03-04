const Order = require("../models/orders");
const Product = require("../models/product");

exports.create = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const order = new Order({
      buyerId: userId,
      productId: productId,
      quantity: quantity,
      total: product.price * quantity,
    });
    await order.save();
    res.status(200).json(order);
  } catch (e) {
    res.status(400).json(e.message);
  }
};

exports.status = async (req, res) => {
  const { userId, productId, orderId } = req.params;
  const { status } = req.body;
  try {
    const updatestatus = await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { currentStatus: status } },
      { new: true }
    );
    res.status(200).json(updatestatus);
  } catch (e) {
    res.status(400).json(e.message);
  }
};
