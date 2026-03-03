<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="showSearch ? searchResult : stories"
      row-key="_id"
      :loading="!!isLoading"
      :pagination="showSearch || !countStories ? false : {
        current: page + 1,
        total: countStories || 0
      }"
      @change="page = $event.current - 1"
    >
      <nuxt-link
        slot="customTitle"
        slot-scope="title, story"
        :to="{
          name: 'story',
          params: {
            id: story._id
          }
        }"
        class="customTitle"
      >
        <span class="customAvatar">
          <img width="60" height="80" :src="story.avatar" alt="">
        </span>
        <span class="story-title">{{ title }}</span>
      </nuxt-link>
      <span slot="action" slot-scope="text, story">
        <a-button
          size="small"
          type="primary"
          class="custom-btn-font"
          @click="$router.push({ name: 'story', params: { id: story._id } })"
        >
          Düzenle
        </a-button>
        <a-popconfirm
          title="Emin misiniz?"
          ok-text="Sil"
          cancel-text="İptal"
          @confirm="deleteStory(story._id)"
        >
          <a-button size="small" type="danger" class="custom-btn-font" icon="delete" />
        </a-popconfirm>
      </span>
      <span slot="customUpdatedAt" slot-scope="updatedAt">
        {{ $moment(updatedAt).format('ll') }}
      </span>

      <div
        slot="filterDropdown"
        style="padding: 8px"
        class="search-filter"
      >
        <a-input
          v-model="keyword"
          placeholder="Ara"
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          :disabled="!keyword"
          @click="search()"
        >
          Bul
        </a-button>
        <a-button
          size="small"
          style="width: 90px"
          @click="showSearch = false; searchResult = []"
        >
          İptal
        </a-button>
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
    </a-table>
    <portal to="header">
      <a-button
        v-if="['mod', 'admin'].includes(user.role)"
        type="primary"
        icon="thunderbolt"
        size="large"
        ghost
        @click="visible = true"
      >
        DIŞARIDAN İÇE AKTAR
      </a-button>
      <a-button
        type="primary"
        icon="plus"
        size="large"
        @click="$router.push({ name: 'create' })"
      >
        YENİ EKLE
      </a-button>
    </portal>
    <a-modal
      title="MANGA İÇE AKTAR"
      :visible="visible"
      :confirm-loading="confirmLoading"
      :ok-button-props="
        {
          props: { disabled: !leech.site || !leech.source }
        }
      "
      @ok="handleOk"
      @cancel="visible = false"
    >
      <a-form-model :model="leech">
        <a-form-model-item label="Kaynak Site">
          <a-select default-value="nettruyen" @change="leech.site = $event">
            <a-select-option value="nettruyen">
              Net Truyện
            </a-select-option>
            <a-select-option value="medoctruyen">
              Mê Đọc Truyện
            </a-select-option>
            <a-select-option value="mangaxy">
              MangaXY
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="Manga Linki (URL)">
          <a-input v-model="leech.source" placeholder="Manga Linki (URL) Giriniz" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { COUNT_STORIES, MY_STORIES, SEARCH_STORIES } from '~/schema/queries/story'
import { DELETE_STORY, IMPORT_STORY } from '~/schema/mutations/story'

const columns = [
  {
    title: 'İsim',
    dataIndex: 'title',
    key: 'name',
    scopedSlots: { customRender: 'customTitle' }
  },
  {
    title: 'Bölüm Sayısı',
    dataIndex: 'countChapter',
    key: 'countChapter',
    align: 'center'
  },
  {
    title: 'Görüntülenme',
    dataIndex: 'views',
    key: 'views',
    align: 'center'
  },
  {
    title: 'Güncellenme',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    align: 'center',
    scopedSlots: { customRender: 'customUpdatedAt' }
  },
  {
    title: 'Aksiyonlar',
    key: 'action',
    scopedSlots: {
      customRender: 'action',
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon'
    },
    align: 'center'
  }
]

export default {
  name: 'StoriesPage',
  data () {
    return {
      columns,
      page: 0,
      stories: [],
      isLoading: 0,
      keyword: '',
      searchResult: [],
      showSearch: false,
      confirmLoading: false,
      visible: false,
      leech: {
        site: 'nettruyen',
        source: ''
      }
    }
  },
  computed: {
    ...mapGetters('user', ['user'])
  },
  apollo: {
    myStories: {
      query: MY_STORIES,
      variables () {
        return {
          order: 'updatedAt',
          sort: -1,
          page: this.page,
          limit: 10
        }
      },
      loadingKey: 'isLoading',
      manual: true,
      fetchPolicy: 'network-only',
      result ({
        data,
        loading
      }) {
        if (!loading) {
          this.stories = (data && data.myStories) ? data.myStories : []
        }
      }
    },

    countStories: {
      query: COUNT_STORIES
    }
  },
  methods: {
    async deleteStory (_id) {
      this.isLoading = 1
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteStory } } = await this.$apollo.mutate({
          mutation: DELETE_STORY,
          variables: {
            _id
          }
        })
        if (deleteStory) {
          this.$message.success('Başarıyla silindi')
          this.stories = Object.values(this.stories).filter(value => value._id !== _id)
        } else {
          this.$message.error('Silme işlemi başarısız')
        }
      } catch (e) {
      }
      this.$nuxt.$loading.finish()
      this.isLoading = 0
    },

    async search () {
      this.isLoading = 1
      this.$nuxt.$loading.start()
      try {
        const { data: { searchMyStories } } = await this.$apollo.query({
          query: SEARCH_STORIES,
          variables: {
            keyword: this.keyword,
            size: 10
          },
          fetchPolicy: 'network-only'
        })
        this.searchResult = searchMyStories
        this.showSearch = true
      } catch (e) {}
      this.$nuxt.$loading.finish()
      this.isLoading = 0
    },

    async handleOk () {
      this.confirmLoading = true
      try {
        const { data: { importStory } } = await this.$apollo.mutate({
          mutation: IMPORT_STORY,
          variables: this.leech
        })
        this.$message.success('Başarıyla eklendi')
        await this.$router.push({
          name: 'story',
          params: { id: importStory._id }
        })
      } catch (e) {
        this.$message.error('Ekleme işlemi başarısız')
      }
      this.confirmLoading = false
    }
  }
}
</script>
<style>
.customAvatar img {
  object-fit: contain;
}
.story-title {
  margin-left: 3px;
}
.search-filter .ant-input {
  width: 188px;
  margin-bottom: 8px;
  display: block;
}
</style>
