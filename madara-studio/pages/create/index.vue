<template>
  <div class="book-form">
    <a-spin :spinning="isLoading">
      <a-form-model
        id="createForm"
        ref="ruleForm"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-model-item ref="avatar" prop="avatar" label="Avatar">
          <a-spin class="loading-avatar" :spinning="isLoadingImage">
            <input
              id="inputAvatar"
              type="file"
              name="inputAvatar"
              accept="image/*"
              @change="openCropImage($event)"
            >
            <label class="pr" for="inputAvatar">
              <img
                :src="form.avatar || 'https://i.imgur.com/59FtdGm.png'"
                alt=""
              >
              <a-icon type="plus-circle" />
            </label>
          </a-spin>
          <template slot="extra">
            <small>
              - Resim yüklemek için tıklayın.
              <br>
              - Kapak kırpma aracı otomatik açılır!
            </small>
          </template>
        </a-form-model-item>

        <a-form-model-item ref="title" prop="title" label="Başlık" has-feedback>
          <a-input
            v-model="form.title"
            placeholder="Manga Başlığı (Örn: One Piece)"
            @blur="$refs.title.onFieldBlur()"
          />
        </a-form-model-item>

        <a-form-model-item ref="otherTitle" label="Diğer İsimleri (Alternatif)" prop="otherTitle">
          <a-input
            v-model="form.otherTitle"
            placeholder="Alternatif İsim (Yoksa boş bırakın)"
          />
        </a-form-model-item>

        <a-form-model-item label="Yazar / Çizer" prop="author">
          <a-input
            v-model="form.author"
            placeholder="Yazar / Çizer Adı"
          />
        </a-form-model-item>

        <a-form-model-item ref="team" prop="team" label="Çeviri Grubu" has-feedback>
          <a-input
            v-model="form.team"
            placeholder="Manga Stüdyonuz"
            @blur="$refs.team.onFieldBlur()"
          />
        </a-form-model-item>
        <a-form-model-item label="Rozet (Hot/New)" prop="badge">
          <a-input
            v-model="form.badge"
            placeholder="Hot, New, Güncel vb."
          />
        </a-form-model-item>

        <a-form-model-item v-if="['mod', 'admin'].includes(user.role)" prop="adsense" label="Reklamları Göster">
          <a-switch v-model="form.adsense" />
        </a-form-model-item>

        <a-form-model-item ref="categories" prop="categories" label="Kategori (Tür)">
          <template slot="extra">
            <small>
              - Kategorileri seçmek için tıklayın veya yazın.
              <br>
              - Tür etiketleri, okuyucuların hikayenizi bulmasına yardımcı olabilir!
            </small>
          </template>

          <div
            v-if="form.categories.length"
            class="book-tags"
            style="margin-bottom: 8px"
          >
            <a-tag
              v-for="(category, index) in form.categories"
              :key="index"
              class="aic"
              color="red"
              @click="
                form.categories = Object.values(form.categories).filter((value) => value !== category)
              "
            >
              {{ category }}
              <a-icon type="close-circle" theme="filled" />
            </a-tag>
          </div>

          <a-select v-model="form.categories" style="width: 100%" mode="multiple" class="categoriesSelect">
            <a-select-option
              v-for="category in getCategories"
              :key="category.name"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="Özet (Hakkında)" prop="content">
          <a-textarea v-model="form.content" placeholder="Manga Özeti Giriniz..." :rows="4" />
        </a-form-model-item>

        <a-form-model-item>
          <a-button type="primary" @click="onSubmit">
            {{ $route.name === 'create' ? 'Oluştur' : 'Düzenle' }}
          </a-button>
          <a-button style="margin-left: 10px;" @click="resetForm">
            Sıfırla
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-spin>

    <a-modal
      v-model="visible"
      :width="560"
      title="RESMİ TAŞIYIN VE KIRPIN"
      cancel-text="İptal"
      ok-text="Kırp"
      :confirm-loading="isLoadingImage"
      @ok="uploadCover"
    >
      <client-only>
        <vue-cropper
          id="cropImage"
          ref="cropper"
          output-type="jpg"
          :src="upload.avatar"
          :auto-crop-area="1"
          :crop-box-resizable="false"
          :toggle-drag-mode-on-dblclick="false"
          :drag-mode="'move'"
          :aspect-ratio="3 / 4"
          :view-mode="1"
          :crop-box-movable="false"
          :min-container-height="200"
          :min-crop-box-width="300"
        />
      </client-only>
      <a-button-group class="crop-image-action">
        <a-button icon="left-circle" @click="$refs.cropper.rotate(-90)" />
        <a-button icon="zoom-out" @click="$refs.cropper.relativeZoom(-0.2)" />
        <a-button icon="zoom-in" @click="$refs.cropper.relativeZoom(0.2)" />
        <a-button icon="right-circle" @click="$refs.cropper.rotate(90)" />
      </a-button-group>
    </a-modal>

    <portal to="header-title">
      <span class="header-title">Yeni Manga Ekle</span>
    </portal>
    <portal v-if="form._id" to="header">
      <a-button
        type="danger"
        icon="delete"
        size="large"
        :disabled="isLoading"
        @click="showConfirm()"
      >
        MANGAYI SİL
      </a-button>
      <a-button
        v-if="form._id"
        type="primary"
        icon="plus"
        size="large"
        :disabled="isLoading"
        @click="$router.push({name: 'chapter', params: { story: $route.params.id }})"
      >
        YENİ BÖLÜM
      </a-button>
    </portal>
  </div>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import { mapGetters } from 'vuex'

import { GET_CATEGORIES } from '~/schema/queries/category'
import { DELETE_STORY, PUBLISH_STORY } from '~/schema/mutations/story'
import { MY_STORY } from '~/schema/queries/story'

import helper from '~/plugins/mixins/helper'

export default {
  name: 'NewBook',
  components: {
    VueCropper
  },
  mixins: [helper],
  async asyncData ({ route, app }) {
    if (route.name === 'story-setting') {
      const { data: { myStory } } = await app.apolloProvider.defaultClient.query({
        query: MY_STORY,
        variables: {
          id: parseInt(route.params.id)
        }
      })
      return {
        form: Object.assign({}, myStory, { categories: Object.assign(myStory.categories).map(value => value.name) })
      }
    } else {
      return {
        form: {
          _id: null,
          avatar: '',
          title: '',
          author: '',
          badge: '',
          team: '',
          otherTitle: '',
          adsense: true,
          categories: [],
          content: ''
        }
      }
    }
  },
  apollo: {
    getCategories: {
      query: GET_CATEGORIES
    }
  },
  data () {
    return {
      visible: false,
      isLoadingImage: false,
      isLoading: false,
      form: {
        _id: null,
        avatar: '',
        title: '',
        author: '',
        team: '',
        otherTitle: '',
        adsense: true,
        categories: [],
        content: ''
      },
      upload: {
        avatar: 'https://cdn.webdammy.com/content/1620901903141_22f315e7-5204-456b-8852-6a6d10764cab.jpg'
      },
      rules: {
        avatar: [
          { required: true, message: 'Kapak resmi zorunludur', trigger: 'blur' },
          { type: 'url', message: 'Geçersiz kapak resmi URLsi', trigger: 'blur' }
        ],
        title: [
          { required: true, message: 'Manga başlığı zorunludur', trigger: 'blur' }
        ],
        team: [
          { required: true, message: 'Çeviri grubu belirtmek zorunludur', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('user', ['user'])
  },
  created () {},
  mounted () {
    this.$nextTick(() => {
      document.querySelector('.categoriesSelect input').setAttribute('placeholder', 'Tìm kiếm thể loại')
    })
  },
  methods: {
    onSubmit () {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.publishStory()
        } else {
          this.$message.error('Lütfen bilgilerinizi kontrol edin')
          return false
        }
      })
    },
    resetForm () {
      this.$refs.ruleForm.resetFields()
    },

    async publishStory () {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { publishStory } } = await this.$apollo.mutate({
          mutation: PUBLISH_STORY,
          variables: this.form
        })
        if (this.form._id) {
          this.$message.success('Güncelleme başarılı')
        } else {
          this.$message.success('Başarıyla oluşturuldu')
          await this.$router.push({
            name: 'story-setting',
            params: { id: publishStory._id }
          })
        }
      } catch (e) {}
      this.$nuxt.$loading.finish()
      this.isLoading = false
    },

    openCropImage ($event) {
      this.upload.avatar = URL.createObjectURL($event.target.files[0])
      this.visible = true
    },

    uploadCover () {
      this.$refs.cropper.getCroppedCanvas().toBlob((data) => {
        if (!data) {
          this.$message.error('Kırpma başarısız')
          return false
        } else {
          this.isLoadingImage = true
          const formData = new FormData()
          formData.append('image', data)
          formData.append('pathName', this.form._id ? `story/${this.form._id}/avatar` : 'temp/book')
          formData.append('type', 'story-avatar')
          this.$nuxt.$loading.start()
          this.$axios
            .post(process.env.BACKEND_DOMAIN + '/upload/single', formData)
            .then(({ data }) => {
              this.form.avatar = data.data
              this.visible = false
              this.$message.success('Başarıyla yüklendi ve kırpıldı')
              this.$refs.avatar.onFieldBlur()
            })
            .catch(() => {
              this.$message.error('Yükleme başarısız (CDN veya Sunucu Hatası)')
            })
            .finally(() => {
              this.isLoadingImage = false
              this.$nuxt.$loading.finish()
            })
        }
      })
    },

    showConfirm () {
      this.$confirm({
        title: 'Silmek istediğinize emin misiniz?',
        content: 'Manganın tüm bölümleri ve içerikleri tamamen silinecek!',
        onOk: () => {
          return this.deleteStory()
        }
      })
    },

    async deleteStory () {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteStory } } = await this.$apollo.mutate({
          mutation: DELETE_STORY,
          variables: {
            _id: this.form._id
          }
        })
        if (deleteStory) {
          this.$message.success('Silme işlemi başarılı')
          await this.$router.push({ name: 'stories' })
        } else {
          this.$message.error('Silme başarısız')
        }
      } catch (e) {}
      this.$nuxt.$loading.finish()
      this.isLoading = false
    }
  }
}
</script>
<style>
.book-form {
  width: 400px;
}

#createForm .ant-select-selection__rendered ul .ant-select-selection__choice {
  display: none;
}
#createForm .ant-select-selection__rendered ul input.ant-select-search__field {
  width: max-content;
}
.book-form {
  display: flex;
}
#inputAvatar {
  display: none;
}
#inputAvatar + label {
  width: 120px;
  height: 160px;
  display: block;
  background-size: contain;
}
.loading-avatar {
  width: 120px;
  height: 160px;
}
#inputAvatar ~ button {
  text-transform: lowercase;
  -webkit-font-feature-settings: 'c2sc';
  font-feature-settings: 'c2sc';
  font-variant: small-caps;
  box-shadow: none !important;
  width: 120px;
}

#inputAvatar + label svg {
  position: absolute;
  top: 70%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  visibility: hidden;
  opacity: 0;
  transition: all 0.25s;
  width: 24px;
  height: 24px;
  fill: white;
  z-index: 11;
}
#inputAvatar + label:before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  opacity: 0;
  background-color: rgba(72, 3, 234, 0.8);
  transition: all 0.25s;
  border-radius: 5px;
  z-index: 10;
  cursor: pointer;
}
#inputAvatar + label:hover:before {
  visibility: visible;
  opacity: 1;
}
#inputAvatar + label:hover svg {
  opacity: 1;
  visibility: visible;
  top: 50%;
}

#cropImage {
  height: 400px;
}
.crop-image-action {
  width: 250px;
  display: flex;
  align-content: center;
  justify-content: space-around;
  margin: 15px auto 0;
}

#cropImage .cropper-dashed {
  /*border-color: #3b66f4;*/
}

#inputAvatar + label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
