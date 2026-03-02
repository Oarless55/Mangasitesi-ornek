const AdmZip = require('adm-zip')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { v4: uuidv4 } = require('uuid')
const mime = require('mime-types')
const Chapter = require('../models/Chapter')
const Story = require('../models/Story')
const bunnycdn = require('../modules/bunnyCDN')
const Image = require('../modules/image')
const Event = require('../events')

class BotController {
    constructor() {
        this.bunnycdn = new bunnycdn(true) // Always use secure path for chapter content
    }

    /**
     * Builds the CDN path for chapter content
     */
    _buildPath(storyId) {
        const time = new Date()
        return `/story/${storyId}/chapter/${time.getFullYear()}/${time.getMonth() + 1}/${time.getDay() + 1}/${time.getHours()}/${uuidv4()}.jpeg`
    }

    /**
     * Processes a single chapter's folder upload
     */
    async processFolderUpload(storyId, chapterName, files) {
        if (!storyId) return { success: false, msg: 'Manga (Story) ID eksik.' }
        if (!chapterName) return { success: false, msg: 'Bölüm adı eksik.' }
        if (!files || files.length === 0) return { success: false, msg: 'Bölüm için hiçbir resim bulunamadı.' }

        try {
            // 1. Check if Story exists
            const story = await Story.findById(storyId)
            if (!story) {
                // Cleanup temp files
                files.forEach(file => Event.removeFile(file.path))
                return { success: false, msg: 'Seçilen manga bulunamadı.' }
            }

            const uploadedCdnUrls = []

            // Sort files naturally by filename to maintain manga page order
            files.sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true, sensitivity: 'base' }))

            // 2. Process and upload each image in the chapter
            for (const file of files) {
                try {
                    const sharp = require('sharp')
                    // Apply Watermark and Resize using Sharp Directly
                    const waterPath = path.join(__dirname, '../public/images', 'watermark@160.png')

                    let img = sharp(file.path)
                        .jpeg({})
                        .resize(1000, null, { fit: 'cover', withoutEnlargement: true })

                    if (fs.existsSync(waterPath)) {
                        img = img.composite([{ input: waterPath, gravity: 'southeast', top: 26, left: 814 }])
                    }

                    const processedImageBuffer = await img.toBuffer()

                    const cdnPath = this._buildPath(storyId)

                    // Upload to BunnyCDN
                    await this.bunnycdn.upload(processedImageBuffer, cdnPath)

                    // Generate public URL
                    const webUrl = bunnycdn.webAssets(cdnPath, true)
                    uploadedCdnUrls.push({
                        content: webUrl
                    })

                } catch (imgError) {
                    console.error(`Error processing/uploading ${file.originalname}:`, imgError)
                } finally {
                    // Always cleanup the temporary file Multer created
                    Event.removeFile(file.path)
                }
            }

            if (uploadedCdnUrls.length === 0) {
                return { success: false, msg: `${chapterName} için resimler işlenemedi veya CDN'e yüklenemedi.` }
            }

            // 3. Save Chapter to Database
            // Get the highest order number for this story to append to the end
            const lastChapter = await Chapter.findOne({ story: storyId }).sort('-order')
            const nextOrder = lastChapter ? lastChapter.order + 1 : 1

            await Chapter.create({
                name: chapterName, // E.g., "Bölüm 1" or just "1"
                nameExtend: '',
                story: storyId,
                content: uploadedCdnUrls,
                order: nextOrder,
                source: `bot-folder-${uuidv4()}`
            })

            // 4. Update Story updated time
            await Story.findByIdAndUpdate(storyId, { updatedAt: Date.now() })

            return {
                success: true,
                msg: `${chapterName} başarıyla eklendi (${uploadedCdnUrls.length} sayfa).`
            }

        } catch (e) {
            console.error('Bot Controller Folder Upload Error:', e)
            return { success: false, msg: 'Bölüm yüklenirken sistem hatası: ' + e.message }
        }
    }
}

module.exports = BotController
