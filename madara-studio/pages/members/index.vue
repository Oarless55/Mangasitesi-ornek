<template>
  <div>
    <a-spin :spinning="isLoading">
      <a-table :columns="columns" :data-source="users" row-key="_id">
        <span slot="avatar" slot-scope="text, record">
          <a-avatar :src="record.avatar || 'https://i.imgur.com/59FtdGm.png'" />
        </span>
        <span slot="role" slot-scope="text, record">
          <a-tag :color="getRoleColor(record.role)">
            {{ record.role.toUpperCase() }}
          </a-tag>
        </span>
        <span slot="createdAt" slot-scope="text, record">
          {{ record.createdAt ? $moment(record.createdAt).format('DD.MM.YYYY HH:mm') : '-' }}
        </span>

        <span slot="action" slot-scope="text, record">
          <a-dropdown>
            <a-button size="small" style="margin-right: 8px">
              Yetkilendir <a-icon type="down" />
            </a-button>
            <a-menu slot="overlay" @click="(e) => changeRole(record, e.key)">
              <a-menu-item key="user" :disabled="record.role === 'user'">Kullanıcı Yap</a-menu-item>
              <a-menu-item key="mod" :disabled="record.role === 'mod'">Moderatör Yap</a-menu-item>
              <a-menu-item key="admin" :disabled="record.role === 'admin'">Admin Yap</a-menu-item>
            </a-menu>
          </a-dropdown>

          <a-popconfirm
            title="Kullanıcı silinecek. Emin misiniz?"
            ok-text="Evet, Sil"
            cancel-text="İptal"
            @confirm="deleteUser(record._id)"
          >
            <a-button size="small" type="danger" icon="delete">Sil</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </a-spin>
    <portal to="header-title">
      <span class="header-title">Üye Yönetimi</span>
    </portal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GET_USERS } from '~/schema/queries/user'
import { UPDATE_USER_ROLE, DELETE_USER } from '~/schema/mutations/user'

const columns = [
  {
    title: 'Avatar',
    key: 'avatar',
    scopedSlots: { customRender: 'avatar' },
    width: '80px'
  },
  {
    title: 'ID',
    dataIndex: '_id',
    key: '_id',
    width: '10%'
  },
  {
    title: 'İsim',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'E-posta',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: 'Rol',
    key: 'role',
    scopedSlots: { customRender: 'role' }
  },
  {
    title: 'Kayıt Tarihi',
    key: 'createdAt',
    scopedSlots: { customRender: 'createdAt' }
  },
  {
    title: 'İşlemler',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'right'
  }
]

export default {
  name: 'MembersPage',
  data () {
    return {
      columns,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('user', ['user'])
  },
  apollo: {
    users: {
      query: GET_USERS,
      update: data => data.getUsers,
      fetchPolicy: 'network-only'
    }
  },
  methods: {
    getRoleColor (role) {
      if (role === 'admin') { return 'red' }
      if (role === 'mod') { return 'blue' }
      return 'green'
    },
    async changeRole (record, newRole) {
      if (record._id === this.user._id) {
        return this.$message.error('Kendi yetkinizi değiştiremezsiniz')
      }
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { updateUserRole } } = await this.$apollo.mutate({
          mutation: UPDATE_USER_ROLE,
          variables: { _id: record._id, role: newRole }
        })
        if (updateUserRole) {
          this.$message.success('Yetki güncellendi')
          this.$apollo.queries.users.refetch()
        }
      } catch (e) {
      }
      this.$nuxt.$loading.finish()
      this.isLoading = false
    },
    async deleteUser (_id) {
      if (_id === this.user._id) {
        return this.$message.error('Kendinizi silemezsiniz')
      }
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteUser } } = await this.$apollo.mutate({
          mutation: DELETE_USER,
          variables: { _id: parseFloat(_id) }
        })
        if (deleteUser) {
          this.$message.success('Kullanıcı başarıyla silindi')
          this.$apollo.queries.users.refetch()
        }
      } catch (e) {
      }
      this.$nuxt.$loading.finish()
      this.isLoading = false
    }
  }
}
</script>
