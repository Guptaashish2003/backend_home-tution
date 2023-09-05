// couponModel.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  percentage: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: {
    type: Date,
    default: Date.now
},
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;