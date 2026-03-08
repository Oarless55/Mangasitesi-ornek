const { v4: uuidv4 } = require('uuid')
const bunnycdn = require('../modules/bunnyCDN')
const Event = require('../events')

const Image = require('../modules/image')

class UploadController {
  /**
   * @param path
   * @returns {string}
   * @private
   */
  _buildPath(path) {
    const time = new Date()
    return `/${path}/${time.getFullYear()}/${time.getMonth() + 1}/${time.getDay() + 1
      }/${time.getHours()}/${uuidv4()}.jpeg`
  }

  async uploadSingle(type, file, path) {
    try {
      let { image, securePath } = await this._detachPath(type, file.path)
      let path1 = this._buildPath(path)
      const BunnyCDN = new bunnycdn(securePath)

      // try {
      //   await BunnyCDN.upload(image, path1)
      // } catch (uploadError) {
      //   console.log('CDN Upload Error (Check API Keys in .env):', uploadError.message)
      //   Event.removeFile(file.path)
      //   return null
      // }

      // LOCAL DEV FIX: Save the file locally since we are bypassing BunnyCDN
      const fs = require('fs')
      const nodePath = require('path')

      const fullLocalPath = nodePath.join(__dirname, '..', 'public', 'upload', path1)
      const dirName = nodePath.dirname(fullLocalPath)

      // Ensure directory exists
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true })
      }

      // Write the buffer to disk
      fs.writeFileSync(fullLocalPath, image)

      Event.removeFile(file.path)
      // return bunnycdn.webAssets(path1, securePath)
      console.log('--- LOCAL DEV BYPASS: Skipped bunnyCDN upload, saved locally to', fullLocalPath)

      // Return path without leading slash so webAssets startsWith logic works correctly
      return path1.startsWith('/') ? path1.substring(1) : path1
    } catch (e) {
      console.log('Upload Error:', e)
      Event.removeFile(file.path)
      return { _error: e.message || 'Unknown processing error' }
    }
  }

  /**
   * Xác định secure pth và resize
   * @param type
   * @param file
   * @returns {Promise<{image: *, securePath: boolean}>}
   * @private
   */
  async _detachPath(type, file) {
    let image
    let securePath = false
    const Picture = new Image(file)
    switch (type) {
      case 'user-avatar':
        image = await Picture.resize(150, 150)
        break
      case 'story-avatar':
        image = await Picture.resizeWithWater('credit@180.png', 600, 800, 720, 210)
        break
      case 'chapter-avatar':
        // width: 500, height: 312
        image = await Picture.resizeWithWater('credit@110.png', 500, 310, 260, 26)
        break
      case 'chapter-content':
        securePath = true
        image = await Picture.resizeWithWater('watermark@160.png', 1000, null, 26, 814)
        break
      default:
        image = await Picture.resize(300)
    }
    return { image, securePath }
  }
}

module.exports = UploadController
