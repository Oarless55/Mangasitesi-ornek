<template>
  <div>
    <a-spin :spinning="isLoading">
      <a-table :columns="columns" :data-source="categories" row-key="_id">
        <span slot="action" slot-scope="text, record">
          <a-popconfirm
            title="Emin misiniz?"
            ok-text="Sil"
            cancel-text="İptal"
            @confirm="deleteCategory(record._id)"
          >
            <a-button size="small" type="danger" icon="delete">Sil</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </a-spin>
    <portal to="header">
      <a-button
        type="primary"
        icon="plus"
        size="large"
        @click="showAddModal"
      >
        YENİ KATEGORİ
      </a-button>
    </portal>
    <portal to="header-title">
      <span class="header-title">Kategori Yönetimi</span>
    </portal>

    <a-modal
      v-model="addModalVisible"
      title="Yeni Kategori Ekle"
      ok-text="Ekle"
      cancel-text="İptal"
      :confirm-loading="isLoading"
      @ok="handleAdd"
    >
      <a-input v-model="newCategoryName" placeholder="Kategori Adı" @keyup.enter="handleAdd" />
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GET_CATEGORIES } from '~/schema/queries/category'
import { CREATE_CATEGORY, DELETE_CATEGORY } from '~/schema/mutations/category'

const columns = [
  {
    title: 'ID',
    dataIndex: '_id',
    key: '_id',
    width: '10%'
  },
  {
    title: 'Kategori Adı',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'URL Kısa Adı (Slug)',
    dataIndex: 'slug',
    key: 'slug'
  },
  {
    title: 'İşlemler',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'right',
    width: '15%'
  }
]

export default {
  name: 'CategoriesPage',
  data () {
    return {
      columns,
      isLoading: false,
      addModalVisible: false,
      newCategoryName: ''
    }
  },
  computed: {
    ...mapGetters('user', ['user'])
  },
  apollo: {
    categories: {
      query: GET_CATEGORIES,
      update: data => data.getCategories,
      fetchPolicy: 'network-only'
    }
  },
  methods: {
    showAddModal () {
      this.newCategoryName = ''
      this.addModalVisible = true
    },
    async handleAdd () {
      if (!this.newCategoryName.trim()) {
        return this.$message.error('Kategori adı boş olamaz')
      }
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { createCategory } } = await this.$apollo.mutate({
          mutation: CREATE_CATEGORY,
          variables: { name: this.newCategoryName.trim() }
        })
        if (createCategory) {
          this.$message.success('Kategori eklendi')
          this.addModalVisible = false
          this.$apollo.queries.categories.refetch()
        }
      } catch (e) {
      }
      this.$nuxt.$loading.finish()
      this.isLoading = false
    },
    async deleteCategory (_id) {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteCategory } } = await this.$apollo.mutate({
          mutation: DELETE_CATEGORY,
          variables: { _id: parseFloat(_id) }
        })
        if (deleteCategory) {
          this.$message.success('Başarıyla silindi')
          this.$apollo.queries.categories.refetch()
        } else {
          this.$message.error('Silme başarısız')
        }
      } catch (e) {
      }
      this.$nuxt.$loading.finish()
      this.isLoading = false
    }
  }
}
</script>
