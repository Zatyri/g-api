const users = [
  {
    name: "Tommy Testman",
    userName: "tester",
    type: "sales",
    store: 4010,
    id: "1",
  },
  {
    name: "Administrator",
    userName: "admin",
    type: "admin",
    store: 4010,
    id: "2",
  },
];

const resolvers = {
  Query: {
    allUsers: () => users,
    getUserById: (_, args) => 
      users.find((user) => user.id === args.id)    
  },
};

module.exports = resolvers;
