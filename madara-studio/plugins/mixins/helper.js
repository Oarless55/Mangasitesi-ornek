export default {
  methods: {
    // eslint-disable-next-line space-before-function-paren
    webAssets(url) {
      if (!url) { return '' }

      let parsedPath = url
      if (url.startsWith('http') || url.startsWith('https')) {
        try {
          const u = new URL(url)
          if (u.hostname.includes('b-cdn.net') || (process.env.DOMAIN_CDN && url.includes(process.env.DOMAIN_CDN))) {
            parsedPath = u.pathname.replace(/^(\/)/, '')
          } else {
            return url
          }
        } catch (e) {
          return url
        }
      }

      const cleanUrl = parsedPath.startsWith('/') ? parsedPath.substring(1) : parsedPath

      if (cleanUrl.startsWith('temp/book/') || cleanUrl.startsWith('story/') || cleanUrl.startsWith('user/')) {
        return process.env.BACKEND_DOMAIN + '/upload/' + cleanUrl
      }

      const cdn = process.env.DOMAIN_CDN || ''
      return cdn.endsWith('/') ? cdn + cleanUrl : cdn + '/' + cleanUrl
    }
  }
}
