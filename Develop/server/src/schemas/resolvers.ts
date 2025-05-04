import User from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (context.user) {
        return User.findById(context.user._id).populate('savedBooks');
      }
      throw new Error('Not authenticated');
    },
  },
  Mutation: {
    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await user.isCorrectPassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_parent, { bookData }, context) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).populate('savedBooks');
      }
      throw new Error('Not authenticated');
    },
    removeBook: async (_parent, { bookId }, context) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');
      }
      throw new Error('Not authenticated');
    },
  },
};

export default resolvers;