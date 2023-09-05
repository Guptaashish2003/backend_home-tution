const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
    },
    isDemo: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    studyMode:{type: String},
    studyTerm:{type: String},
    locationUrl:{type: String},
    studyHours:{type: String},
    totalPrice:{type: Number},
    paymentMode:{type: String},
    specialization:[{type: String}],
    paymentInfo: {
        id: { type: String },
        status: { type: String }
    },

    bookingStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'completed'],
        default: 'Pending'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;