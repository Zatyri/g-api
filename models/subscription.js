const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  talk: {
    type: String,
    required: true,
  },
  sms: {
    type: String,
    required: true,
  },
  speed: {
    type: Number,
    required: true,
  },
  unlimited: {
    type: Boolean,
    required: true,
  },
  eu: {
    type: Number,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  hasOffer: {
    type: Boolean,
    required: true,
  },
  offer: {
    type: String,
  },
  offerValue: {
    type: Number,
    min: 1,
    max: 5
  },
  oneTimeDiscount: {
    type: String,
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Operator',
  },
  equivelentSub: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
  ],
  benefits: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model('Subscription', schema);
