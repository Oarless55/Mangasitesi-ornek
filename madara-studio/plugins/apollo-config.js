/* global $nuxt */
import { onError } from 'apollo-link-error'
export default ({ store, redirect }) => {
  const errorLink = onError(({ networkError, graphQLErrors, response }) => {
    if (process.browser) {
      if (networkError) {
        $nuxt.$emit('addNotify', {
          id: Math.random(),
          success: false,
          msg: 'Bağlantı hatası'
        })
      }
    }
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (['UNAUTHENTICATED', 'FORBIDDEN', 'NOTIFY'].includes(extensions.code)) {
          switch (extensions.code) {
            // yêu cầu đăng nhập
            case 'UNAUTHENTICATED':
              if (process.browser) {
                console.log('Bypassing UNAUTHENTICATED error locally.')
              }
              break
            case 'FORBIDDEN':
              if (process.browser) {
                console.log('Bypassing FORBIDDEN error locally.')
              }
              break
            case 'NOTIFY':
              $nuxt.$message.error(message)
              break
          }
        }
      })
    }
  })
  return {
    link: errorLink,
    httpEndpoint: process.env.GRAPHQL_SERVER,

    // override HTTP endpoint in browser only
    // browserHttpEndpoint: '/graphql',

    // See https://www.apollographql.com/docs/link/links/http.html#options
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    // You can use `wss` for secure connection (recommended in production)
    // Use `null` to disable subscriptions
    wsEndpoint: '',

    authenticationType: 'Bearer',

    // Token name for the cookie which will be set in case of authentication
    tokenName: 'apollo-token',

    // Enable Automatic Query persisting with Apollo Engine
    persisting: false
  }
}
