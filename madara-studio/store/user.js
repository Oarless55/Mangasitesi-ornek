import { GET_MY_ACCOUNT } from '~/schema/queries/user'

export const state = () => ({
  user: {}
})

export const getters = {
  user: state => state.user,
  auth: () => true, // FORCE TRUE FOR DEV BYPASS
  isMod: () => true // FORCE TRUE FOR DEV BYPASS
}

// mutations
export const mutations = {
  SET_USER (state, data) {
    state.user = data
  }
}

export const actions = {
  async getMyAccount ({ dispatch }) {
    try {
      const {
        data: { me }
      } = await this.app.apolloProvider.defaultClient.query({
        query: GET_MY_ACCOUNT
      })
      dispatch('setUser', me)
    } catch (e) {
      console.log(e)
      // reload để thực hiện các thay đổi
      // dispatch('logOut')
    }
  },
  setUser ({ commit }, user) {
    commit('SET_USER', user)
  },
  async logOut ({ commit }) {
    this.$cookies.remove('apollo-token')
    await this.$apolloHelpers.onLogout()
    commit('SET_USER', {})
    if (process.browser && this.$router.currentRoute.path !== '/') {
      this.$router.push('/')
    }
  }
}
