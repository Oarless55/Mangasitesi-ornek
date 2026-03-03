<template>
  <div class="bot-container">
    <a-card title="Otomatik Bot (Toplu Klasör Yükleme)">
      <p style="margin-bottom: 20px;">
        Bilgisayarınızdaki manganın bölümlerini toplu olarak yükleyebilirsiniz. ZIP arşiviyle uğraşmanıza gerek yok.
        <br><b>Format Kuralı:</b> Doğrudan içerisinde bölüm klasörleri olan (Örn: <code>Bölüm 1</code>, <code>2</code>) ve bu klasörlerin içerisinde manga sayfaları (.jpg, .png, vb.) bulunan ana klasörü seçin.
      </p>

      <a-form-model
        id="botForm"
        ref="botFormRule"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-model-item ref="story" prop="story" label="Manga Seçin">
          <a-select v-model="form.story" style="width: 100%" placeholder="Bölümlerin ekleneceği mangayı seçin">
            <a-select-option
              v-for="story in myStories"
              :key="story._id"
              :value="story._id"
            >
              {{ story.title }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="Klasör Seçin">
          <div class="upload-zone">
            <input
              id="folderInput"
              webkitdirectory
              directory
              multiple
              name="images"
              type="file"
              :disabled="isUploading"
              @change="onFolderChange"
            >
            <label for="folderInput" class="upload-label">
              <a-icon type="folder-open" style="font-size: 32px; color: #1890ff; margin-bottom: 10px;" />
              <p v-if="Object.keys(groupedChapters).length === 0">Bilgisayarınızdan klasör seçmek için tıklayın</p>
              <div v-else style="color: #52c41a; font-weight: bold; text-align: center;">
                <p>Toplam {{ Object.keys(groupedChapters).length }} Bölüm ve {{ totalFilesCount }} Sayfa Bulundu.</p>
                <div v-if="isUploading" style="margin-top: 10px; color: #fa8c16;">
                  {{ uploadProgressText }}
                </div>
              </div>
            </label>
          </div>
        </a-form-model-item>

        <a-form-model-item>
          <a-button
            type="primary"
            size="large"
            icon="cloud-upload"
            :loading="isUploading"
            :disabled="isUploading || Object.keys(groupedChapters).length === 0"
            style="width: 100%"
            @click="submitUpload"
          >
            {{ isUploading ? 'Bölümler Yükleniyor (Sistemi kapatmayın!)...' : 'Bölümleri Yüklemeye Başla' }}
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </div>
</template>

<script>
import { MY_STORIES } from '~/schema/queries/story'

export default {
  name: 'BotUploadPage',
  data () {
    return {
      isUploading: false,
      groupedChapters: {},
      totalFilesCount: 0,
      uploadProgressText: '',
      form: {
        story: undefined
      },
      myStories: [],
      rules: {
        story: [
          { required: true, message: 'Lütfen bir manga seçin', trigger: 'change' }
        ]
      }
    }
  },
  apollo: {
    myStories: {
      query: MY_STORIES,
      update: data => data.myStories,
      variables () {
        return {
          order: 'date',
          sort: -1,
          page: 0,
          limit: 1000 // Get all stories for the dropdown
        }
      }
    }
  },
  methods: {
    onFolderChange (e) {
      const files = Array.from(e.target.files)
      if (files.length === 0) { return }

      this.groupedChapters = {}
      this.totalFilesCount = 0

      // Group images by their immediate parent folder (chapter Name)
      files.forEach(file => {
        // filter for images only
        if (!file.type.startsWith('image/')) return;
        
        // webkitRelativePath usually looks like: "MangaName/Chapter1/01.jpg"
        const pathParts = file.webkitRelativePath.split('/')
        if (pathParts.length >= 2) {
          const chapterName = pathParts[pathParts.length - 2]
          
          if (!this.groupedChapters[chapterName]) {
            this.groupedChapters[chapterName] = []
          }
          this.groupedChapters[chapterName].push(file)
          this.totalFilesCount++
        }
      })

      if (Object.keys(this.groupedChapters).length === 0) {
        this.$message.error('Seçilen klasörde resim barındıran hiçbir alt klasör bulunamadı.')
        e.target.value = ''
      }
    },

    async submitUpload () {
      if (!this.form.story) {
        this.$message.error('Lütfen bir manga seçin')
        return
      }

      const chapterNames = Object.keys(this.groupedChapters)
      if (chapterNames.length === 0) {
        this.$message.error('Yüklenecek hiçbir bölüm bulunamadı')
        return
      }

      this.isUploading = true
      this.$nuxt.$loading.start()

      // Sort chapters naturally 
      chapterNames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

      let successCount = 0
      let failCount = 0

      for (let i = 0; i < chapterNames.length; i++) {
        const chapterName = chapterNames[i]
        const files = this.groupedChapters[chapterName]

        this.uploadProgressText = `[${i + 1}/${chapterNames.length}] ${chapterName} yükleniyor... (${files.length} Sayfa)`

        const formData = new FormData()
        formData.append('story', this.form.story)
        formData.append('chapterName', chapterName)
        
        files.forEach(file => {
          formData.append('images', file)
        })

        try {
          const { data } = await this.$axios.post(process.env.BACKEND_DOMAIN + '/upload/bot', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          if (data.success) {
            successCount++
          } else {
            failCount++
            this.$message.error(`${chapterName}: ${data.msg}`)
          }
        } catch (err) {
          console.error(err)
          failCount++
          this.$message.error(`${chapterName} yüklenirken sunucu hatası oluştu.`)
        }
      }

      this.$message.success(`${successCount} bölüm başarıyla eklendi, ${failCount} bölüm başarısız oldu.`)
      
      // Cleanup UI
      this.isUploading = false
      this.$nuxt.$loading.finish()
      this.groupedChapters = {}
      this.totalFilesCount = 0
      document.getElementById('folderInput').value = ''
      this.form.story = undefined
      this.uploadProgressText = ''
    }
  }
}
</script>

<style scoped>
.bot-container {
  max-width: 600px;
  margin: 0 auto;
}
.upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  position: relative;
}
.upload-zone:hover {
  border-color: #1890ff;
}
#folderInput {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}
.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  cursor: pointer;
  z-index: 1;
  position: relative;
}
</style>
