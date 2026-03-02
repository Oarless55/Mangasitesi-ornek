const AuthController = require('../../controller/auth.controller')
const UserController = require('../../controller/user.controller')

module.exports = {
  Query: {
    me: (_, { }, { user }) => {
      return user
    },
    getUsers: async (_, { }, { user }) => {
      const userController = new UserController(user)
      return userController.getUsers()
    }
  },

  Mutation: {
    signinUser: async (_, { email, password }) => {
      const authController = new AuthController()
      return authController.login(email, password)
    },

    signupUser: async (_, { name, email, password }) => {
      const authController = new AuthController()
      return authController.signup(name, email, password)
    },

    userSettings: async (_, { key, value }, { user }) => {
      const userController = new UserController(user)
      return userController.update(key, value)
    },

    changePassword: async (_, { oldPass, newPass }, { user }) => {
      const userController = new UserController(user)
      return userController.changePassword(oldPass, newPass)
    },

    updateUserRole: async (_, { _id, role }, { user }) => {
      const userController = new UserController(user)
      return userController.updateRole(_id, role)
    },

    deleteUser: async (_, { _id }, { user }) => {
      const userController = new UserController(user)
      return userController.deleteUser(_id)
    }
  }
}
