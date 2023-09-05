const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    txnid:{
        type:String
    },

    transactionStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'success', 'cancel','fail'],
        default: 'Pending'
    },
    paidAt:{
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction
;