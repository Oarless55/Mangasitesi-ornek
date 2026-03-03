export default ({ store, route, redirect }) => {
  // Normalize the path by removing trailing slashes except for the root itself
  const normalizedPath = route.path === '/' ? '/' : route.path.replace(/\/$/, '')

  // If the user is authenticated
  if (store.getters['user/auth']) {
    // And they visit the login page (root url)
    if (normalizedPath === '/') {
      return redirect('/stories')
    }
  } else {
    // If the user is NOT authenticated
    // And they are NOT already on the login page (root url)
    if (normalizedPath !== '/') {
      return redirect('/')
    }
  }
}
