require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("../middleware/logger");

const User = require("../models/user");
const { AuthenticationError } = require("apollo-server");

const resolvers = {
  Query: {
    allUsers: () => User.find({}),
    getUserById: (_, args) => User.findOne({ id: args.id }),
    getUserByUsername: (_, args) => User.findOne({ username: args.username }),
    me: (_, __, context) => context.currentUser,
  },

  Mutation: {
    addUser: async (_, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser.type === "admin") {
        throw new AuthenticationError("not authenticated");
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
    deleteUser: async (_, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser.type === "admin") {
        throw new AuthenticationError("not authenticated");
      }

      const userToDelete = await User.findOne({ username: args.username });

      try {
        await userToDelete.deleteOne();
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
          throw new Error("Invalid username or password");
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
      }
    },
  },
};

module.exports = resolvers;
