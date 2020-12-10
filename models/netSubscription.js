const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  speed: {
    type: String,
    required: true,
  },
  eu: {
    type: Number,
    required: false,
  },
  price: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true
  },
  hasOffer: {
    type: Boolean,
    required: true,
  },
  offer: {
    type: String,
  },
  offerLength: {
    type: Number
  },
  bindingOffer: {
    type: Boolean
  },
  offerValue: {
    type: Number,
    min: 1,
    max: 5
  },
  oneTimeDiscount: {
    type: Number,
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Operator',
  }, 
  benefits: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model('NetSubscription', schema);
