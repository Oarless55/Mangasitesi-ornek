const axios = require('axios')
const crypto = require('crypto')
class Index {
  constructor(secure) {
    this.AccessKey = secure ? process.env.BUNNY_ACCESS_KEY : process.env.BUNNY_ACCESS_KEY_2
    this.storage = secure ? process.env.BUNNY_STORAGE_SERVER : process.env.BUNNY_STORAGE_SERVER_2
  }

  async upload(data, path) {
    return await axios.put(this._getPath(path), data, {
      headers: {
        AccessKey: this.AccessKey,
        'Content-Type': 'image/jpeg'
      }
    })
  }

  /**
   * Tạo path
   * @param path
   * @returns {string}
   * @private
   */
  _getPath(path) {
    return `${this.storage}${path}`
  }

  /**
   * @param { String } path
   * @returns {Promise<boolean>}
   */
  async remove(path) {
    try {
      await axios.delete(this._getPath(path), {
        headers: {
          AccessKey: this.AccessKey
        }
      })
      return true
    } catch (e) {
      return false
    }
  }

  static webAssets(url, secure) {
    if (!url) {
      return ''
    }

    // Parse the path out if it's already a full URL (to fix old CDN URLs saved in DB)
    let parsedPath = url.replace(/^(\/)/, ''); // Remove leading slash FIRST
    if (url.startsWith('http') || url.startsWith('https')) {
      try {
        const u = new URL(url);
        // If it's a known CDN domain, extract the pathname
        if (u.hostname.includes('b-cdn.net') || url.includes(process.env.CDN_DOMAIN)) {
          parsedPath = u.pathname.replace(/^(\/)/, '');
        } else {
          // Leave external links alone (Imgur, etc)
          return url;
        }
      } catch (e) {
        return url;
      }
    }

    // Code bypassing CDN disabled to allow live server to construct absolute URLs

    const domain2 = process.env.CDN_DOMAIN_2.endsWith('/') ? process.env.CDN_DOMAIN_2 : process.env.CDN_DOMAIN_2 + '/';
    const domain1 = process.env.CDN_DOMAIN.endsWith('/') ? process.env.CDN_DOMAIN : process.env.CDN_DOMAIN + '/';

    if (!secure) {
      return domain2 + parsedPath;
    }
    if (process.env.SECURE_ENABLE === '1') {
      const expires = Math.floor(new Date() / 1000) + 3600;
      // Notice the security key hashing logic on bunnyCDN usually requires a leading slash in the path string
      const hashableBase = process.env.BUNNY_SECURITY_KEY + '/' + parsedPath + expires;
      let token = Buffer.from(crypto.createHash('sha256').update(hashableBase).digest()).toString(
        'base64'
      );
      token = token.replace(/\n/g, '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      return domain1 + parsedPath + '?token=' + token + '&expires=' + expires;
    }
    return domain1 + parsedPath;
  }
}

module.exports = Index
