const sharp = require('sharp')

module.exports = class {
  constructor(image) {
    this.image = image
  }

  async resize(width, height) {
    return sharp(this.image).jpeg({}).resize(width, height, { fit: 'cover' }).toBuffer()
  }

  async resizeWithWater(input, width, height, top, left, gravity = 'southeast') {
    const fs = require('fs')
    const path = require('path')
    const waterPath = path.join(__dirname, 'lib', input)

    let img = sharp(this.image)
      .jpeg({})
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })

    if (fs.existsSync(waterPath)) {
      img = img.composite([{ input: waterPath, gravity, top, left }])
    }

    return img.toBuffer()
  }
}
