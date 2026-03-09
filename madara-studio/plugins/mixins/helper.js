export default {
  methods: {
    // eslint-disable-next-line space-before-function-paren
    webAssets(url) {
      if (!url) { return '' }

      // If the backend returned a full absolute URL (e.g., from BunnyCDN),
      // just trust it and return it immediately.
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }

      const parsedPath = url

      const cleanUrl = parsedPath.startsWith('/') ? parsedPath.substring(1) : parsedPath

      if (cleanUrl.startsWith('temp/book/') || cleanUrl.startsWith('story/') || cleanUrl.startsWith('user/')) {
        return process.env.BACKEND_DOMAIN + '/upload/' + cleanUrl
      }

      const cdn = process.env.DOMAIN_CDN || ''
      return cdn.endsWith('/') ? cdn + cleanUrl : cdn + '/' + cleanUrl
    }
  }
}
