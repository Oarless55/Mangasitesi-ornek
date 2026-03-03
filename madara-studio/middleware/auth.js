export default ({ store, route, redirect }) => {
  // Normalize the path by removing trailing slashes except for the root itself
  const normalizedPath = route.path === '/' ? '/' : route.path.replace(/\/$/, '')

  // Bypassed completely for Local Development access
  if (normalizedPath === '/') {
    return redirect('/stories')
  }
}
