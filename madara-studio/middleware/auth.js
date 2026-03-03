export default ({ store, route, redirect }) => {
  // If the user is authenticated
  if (store.getters['user/auth']) {
    // And they visit the login page (root url)
    if (route.path === '/') {
      return redirect('/stories')
    }
  } else {
    // If the user is NOT authenticated
    // And they are NOT already on the login page (root url)
    if (route.path !== '/') {
      return redirect('/')
    }
  }
}
