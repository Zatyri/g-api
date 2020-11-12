require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../middleware/logger');
var ObjectId = require('mongodb').ObjectID;

const User = require('../models/user');
const Operator = require('../models/operator');
const Subscription = require('../models/subscription');
const { AuthenticationError } = require('apollo-server');
const subscription = require('../models/subscription');
const { findBreakingChanges } = require('graphql');

const resolvers = {
  Query: {
    allUsers: () => User.find({}),
    getUserById: (_, args) => User.findOne({ _id: ObjectId(args.id) }),
    getUserByUsername: (_, args) => User.findOne({ username: args.username }),
    me: (_, __, context) => context.currentUser,
    allOperators: () => Operator.find({}),
    allSubscriptions: () => Subscription.find({}).populate('operator'),
    getSubscriptionById: (_, args) => Subscription.findById(args.id),
  },

  Mutation: {
    addUser: async (_, args, context) => {
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });

      if (currentUser.type === 'store') {
        throw new AuthenticationError('Ei oikeuksia lisätä käyttäjiä');
      }
      if (currentUser.type === 'storeAdmin') {
        if (currentUser.store !== args.store) {
          throw new AuthenticationError(
            'Et voi lisätä käyttäjiä toiselle talolle'
          );
        } else if (args.type === 'admin') {
          throw new AuthenticationError('Et voi luoda admineja');
        }
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(args.password, saltRounds);

      const user = new User({ ...args, passwordHash });

      try {
        await user.save();
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
      return user;
    },
    updateUser: async (_, args, context) => {
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });

      if (currentUser.type === 'store') {
        throw new AuthenticationError('Ei oikeuksia muokata käyttäjiä');
      }
      if (currentUser.type === 'storeAdmin') {
        if (!currentUser.store === args.store) {
          throw new AuthenticationError(
            'Et voi editoida toisen talon käyttäjiä'
          );
        } else if (args.type === 'admin') {
          throw new AuthenticationError('Et voi muuttaa käyttäjiä admineiksi');
        }
      }

      const userToUpdate = await User.findOne({ _id: ObjectId(args.id) });

      if (!userToUpdate) {
        throw new Error('User not found');
      }

      args.name && (userToUpdate.name = args.name);
      args.type && (userToUpdate.type = args.type);
      args.store && (userToUpdate.store = args.store);

      try {
        await userToUpdate.save();
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
      return userToUpdate;
    },
    deleteUser: async (_, args, context) => {
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });

      if (currentUser.type === 'store') {
        throw new AuthenticationError('Ei oikeuksia poistaa käyttäjiä');
      }
      if (
        currentUser.type === 'storeAdmin' &&
        currentUser.store !== args.store
      ) {
        throw new AuthenticationError('Et voi poistaa toisen talon käyttäjiä');
      }

      const userToDelete = await User.findOne({ _id: ObjectId(args.id) });

      try {
        await User.deleteOne({ _id: ObjectId(args.id) });
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }

      return userToDelete;
    },
    login: async (_, args) => {
      const user = await User.findOne({ username: args.username });
      const correctPassword =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.passwordHash);

      try {
        if (!(user && correctPassword)) {
          throw new Error('Invalid username or password');
        }

        const userForToken = {
          username: user.username,
          name: user.name,
          type: user.type,
          store: user.store,
          id: user._id,
        };

        const token = jwt.sign(userForToken, process.env.JWT_SECRET);

        return { value: token };
      } catch (error) {
        logger(error.message);
        throw new AuthenticationError(error.message);
      }
    },
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
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });
      if (!currentUser.type === 'admin') {
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
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });
      if (!currentUser.type === 'admin') {
        throw new AuthenticationError('Ei oikeuksia muokata liittymiä');
      }

      try {
        const response = await Subscription.findByIdAndUpdate(
          args.id,
          { ...args },
          { new: true }
        );
        return response;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    deleteSubscription: async (_, args, context) => {
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });
      if (!currentUser.type === 'admin') {
        throw new AuthenticationError('Ei oikeuksia poistaa liittymiä');
      }
      try {
        const deletedSubscription = await Subscription.findOneAndRemove(
          args.id
        );
        return deletedSubscription;
      } catch (error) {
        logger(error.message);
        throw new Error(error.message);
      }
    },
    addOffer: async (_, args, context) => {
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });
      if (currentUser.type === 'store') {
        throw new AuthenticationError('Ei oikeuksia lisätä tarjouksia');
      }

      try {
        const subscription = await Subscription.findByIdAndUpdate(
          args.id,
          { ...args, hasOffer: true },
          { new: true }
        );
        return subscription;
      } catch (error) {
        logger(error.message);
        throw new Error('Virhe tarjouksen tallennuksessa');
      }
    },
    removeOffer: async (_, args, context) => {
      const currentUser = await User.findOne({
        _id: ObjectId(context.currentUser.id),
      });
      if (currentUser.type === 'store') {
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
  },
};

module.exports = resolvers;
