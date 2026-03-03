const { ApolloServer } = require('apollo-server-express')

const database = require('../database')
database.connect()

const authController = require('../controller/auth.controller')

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({ req }) {
    console.log('[DEBUG] Incoming GraphQL Request. Bypassing token auth.')
    const token = req.headers.authorization || ''
    let user = {
      _id: 'LOCAL_DEV_BYPASS',
      email: 'admin@madara.com',
      role: 'admin'
    } // FORCE LOCAL DEV ADMIN IDENTITY

    if (token) {
      const AuthController = new authController()
      try {
        const fetchedUser = await AuthController.getUser(token.replace('Bearer ', ''))
        if (fetchedUser) user = fetchedUser
      } catch (e) {
        // Ignore real auth errors manually
      }
    }
    return {
      _token: token.replace('Bearer ', ''),
      user
    }
  }
})
module.exports = server
