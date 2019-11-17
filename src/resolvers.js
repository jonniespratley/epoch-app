const notes = [];

const SpotifyResolvers = {
  Query: {
    
  }
};





// Provide resolver functions for our schema fields
const resolvers = {
  
  Query: {
    search: async (parent, args, {dataSources}) => {
      console.log('spotify search');
      return dataSources.spotify.search(args);
    },
    getTrack: async (parent, {id}, {dataSources}) => {
      console.log('spotify getTrack');
      return dataSources.spotify.getTrack({id});
    },
    hello: () => 'Hello world!',
    epochs: async (parent, args, { models }) => {
      return await models.Epoch.find()
    },
    epoch: async (parent, args, { models }) => {
      return await models.Epoch.findById(args.id);
    },
    me: async (parent, args, { user }) => user
  },
  Mutation: {
    newEpoch: async (parent, {input}, { models }) => {
      return await models.Epoch.create({
        ...input,
        user: '5d6e8f3683e8850d0f1c2eb9'
      });
    },
    updateEpoch: async (parent, { input, id }, { models }) => {
      try {
        return await models.Epoch.findOneAndUpdate(
          {
            _id: id,
          },
          {
            $set: {
              input
            }
          },
          {
            new: true
          }
        );
      } catch (err) {
        throw new Error('Error updating Epoch');
      }
    },
    deleteEpoch: async (parent, { id }, { models }) => {
      try {
        await models.Epoch.findOneAndRemove({ _id: id});
        return true;
      } catch (err) {
        return false;
      }
    },
  },
  Epoch: {
    user: async (parent, {user}, {models}) => {
      console.log('find User', parent, user);
      return await models.User.findById(parent.user);
    }
  }
};

module.exports = resolvers;