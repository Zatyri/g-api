const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  antiVirus: {
    type: String,
    required: true,
  },
  antiVirusAmount: {
    type: Number,
    required: true,
  },
  VPN: {
    type: Boolean,
    required: true,
  },
  VPNAmount: {
    type: Number,
    required: true,
  },
  cloud: {
    type: String,
    required: true,
  },
  cloudLimit: {
    type: String,
    required: true,
  },
  office365: {
    type: Boolean,
    required: true
  },
  support: {
    type: Boolean,
    required: true,
  },
  remoteFix: {
    type: Boolean,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  price: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('ServiceAgreement', schema);
