require('dotenv').config();
const logger = require('../middleware/logger');

const Operator = require('../models/operator');
const Subscription = require('../models/subscription');
const NetSubscription = require('../models/netSubscription')
const { AuthenticationError } = require('apollo-server');

const adminAccess = ['admin'];
const storeAdminAccess = ['admin', 'storeadmin'];
const userAccess = ['admin', 'storeadmin', 'user'];

const resolvers = {
  Query: {
    allOperators: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return Operator.find({});
      }
      return null;
    },
    allSubscriptions: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return Subscription.find({}).populate('operator');
      }
      return null;
    },
    allSubscriptionsWithOffer: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return Subscription.find({ hasOffer: true }).populate('operator');
      }
      return null;
    },
    allActiveSubscriptions: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return Subscription.find({ active: true }).populate('operator');
      }
      return null;
    },
    getSubscriptionById: (_, args, context) => {
      if (userAccess.includes(context.role)) {
        return Subscription.findById(args.id);
      }
      return null;
    },
    getSubscriptionByOperatorId: (_, args, context) => {
      if (userAccess.includes(context.role)) {
        return Subscription.find({ operator: args.id });
      }
      return null;
    },
    allNetSubscriptions: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return NetSubscription.find({}).populate('operator');
      }
      return null;
    },
    allNetSubscriptionsWithOffer: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return NetSubscription.find({ hasOffer: true }).populate('operator');
      }
      return null;
    },
    allActiveNetSubscriptions: (_, __, context) => {
      if (userAccess.includes(context.role)) {
        return NetSubscription.find({ active: true }).populate('operator');
      }
      return null;
    },
  },

  Mutation: {
    addOperator: async (_, args) => {
      // not meant to be implemented in frontend
      const operator = new Operator({ ...args });
      try {
        await operator.save();
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
      return operator;
    },
    addSubscription: async (_, args, context) => {
      if (!adminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia lisätä liittymiä');
      }
      const subscription = new Subscription({ ...args, hasOffer: false });

      try {
        await subscription.save();
        const response = await Subscription.findOne({
          name: args.name,
        }).populate('operator');
        return response;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    modifySubscription: async (_, args, context) => {
      if (!adminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia muokata liittymiä');
      }
      try {
        const response = await Subscription.findByIdAndUpdate(
          args.id,
          { ...args },
          { new: true }
        ).populate('operator');

        return response;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    deleteSubscription: async (_, args, context) => {

      if (!adminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia poistaa liittymiä');
      }
      try {
        const deletedSubscription = await Subscription.findByIdAndRemove(
          args.id
        );
        return deletedSubscription;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    addOffer: async (_, args, context) => {

      if (!storeAdminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia lisätä tarjouksia');
      }

      try {
        const subscription = await Subscription.findByIdAndUpdate(
          args.id,
          { ...args, hasOffer: true },
          { new: true }
        ).populate('operator');
        return subscription;
      } catch (error) {
        logger(error.message);
        throw new Error('Virhe tarjouksen tallennuksessa');
      }
    },
    removeOffer: async (_, args, context) => {

      if (!storeAdminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia poistaa tarjouksia');
      }
      try {
        const subscription = await Subscription.findByIdAndUpdate(
          args.id,
          {
            hasOffer: false,
            offer: null,
            offerValue: null,
            oneTimeDiscount: null,
          },
          { new: true }
        );
        return subscription;
      } catch (error) {
        logger(error.message);
        throw new Error('Virhe tarjouksen poistamisessa');
      }
    },
    addNetSubscription: async (_, args, context) => {   
      //!!!!!!!!!!!!!! change to adminaccess when testing done!   
      if (!storeAdminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia lisätä liittymiä');
      }
      const subscription = new NetSubscription({ ...args, hasOffer: false });

      try {
        await subscription.save();
        const response = await NetSubscription.findOne({
          name: args.name,
        }).populate('operator');
        return response;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    modifyNetSubscription: async (_, args, context) => {
      if (!adminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia muokata liittymiä');
      }
      try {
        const response = await NetSubscription.findByIdAndUpdate(
          args.id,
          { ...args },
          { new: true }
        ).populate('operator');

        return response;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    deleteNetSubscription: async (_, args, context) => {

      if (!adminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia poistaa liittymiä');
      }
      try {
        const deletedSubscription = await NetSubscription.findByIdAndRemove(
          args.id
        );
        return deletedSubscription;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    addNetOffer: async (_, args, context) => {

      if (!storeAdminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia lisätä tarjouksia');
      }

      try {
        const subscription = await NetSubscription.findByIdAndUpdate(
          args.id,
          { ...args, hasOffer: true },
          { new: true }
        ).populate('operator');
        return subscription;
      } catch (error) {
        logger(error.message);
        throw new Error('Virhe tarjouksen tallennuksessa');
      }
    },
    removeNetOffer: async (_, args, context) => {
      if (!storeAdminAccess.includes(context.role)) {
        throw new AuthenticationError('Ei oikeuksia poistaa tarjouksia');
      }
      try {     
        
        const subscription = await NetSubscription.findByIdAndUpdate(
          args.id,
          {
            hasOffer: false,
            offer: null,
            offerValue: null,
            oneTimeDiscount: null,
          },
          { new: true }
        );
        return subscription;
      } catch (error) {
        logger(error.message);
        throw new Error('Virhe tarjouksen poistamisessa');
      }
    },
  },
 
};

module.exports = resolvers;
