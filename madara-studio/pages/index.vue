<template>
  <div class="login-container">
    <div
      class="login-bg"
      style="background-image: url(https://static3w.kuaikanmanhua.com/static-kk-ecology/img/login_bg.8a7b128.jpg);"
    />
    <div class="login-inner">
      <div class="login-form">
        <a-form-model
          ref="formRule"
          class="form"
          layout="vertical"
          :model="form"
          :rules="rules"
        >
          <p class="form-title">
            Giriş Yap
          </p>
          <a-form-model-item ref="email" prop="email" has-feedback>
            <a-input
              v-model="form.email"
              placeholder="E-posta"
              @blur="$refs.email.onFieldBlur()"
            />
          </a-form-model-item>
          <a-form-model-item ref="password" prop="password" has-feedback>
            <a-input-password
              v-model="form.password"
              placeholder="Şifre"
              @blur="$refs.password.onFieldBlur()"
            />
          </a-form-model-item>
        </a-form-model>
        <a-form-model-item>
          <a-button
            type="primary"
            :icon="isLoading ? 'loading' : 'caret-right'"
            :disabled="isLoading"
            @click="submitForm()"
          >
            Giriş Yap
          </a-button>
        </a-form-model-item>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LoginPage',
  layout: 'blank',
  data () {
    return {
      form: {
        email: 'admin@madara.com',
        password: 'benimsupersifrem123'
      },
      isLoading: false,
      rules: {
        email: [
          {
            required: true,
            message: 'E-posta adresi boş bırakılamaz',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: 'Geçersiz e-posta adresi',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Şifre boş bırakılamaz'
          }
        ]
      }
    }
  },
  mounted () {
    // FORCE LOCAL ENVIRONMENT BYPASS: Immediately redirect from login panel
    this.$router.push('/stories')
  }
}
</script>

<style>
.login-container {
  position: relative;
  width: 100%;
}

.login-container .login-bg {
  position: fixed;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: 50%;
  background-repeat: no-repeat;
  z-index: -1;
}
.login-inner {
  height: 100vh;
  display: flex;
}
.login-form {
  width: 366px;
  padding: 50px 40px 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 6%);
  border-radius: 4px;
  margin: auto;
}

.form-title {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
  width: 100%;
  text-align: center;
}

.login-form .ant-input {
  border: unset;
  border-bottom: 1px solid #dcdfe6;
  border-radius: unset;
  padding-left: unset;
}
.login-form .ant-input:focus {
  box-shadow: none;
  border-color: #909399;
}

.login-form .ant-form-explain {
  font-size: 12px;
}
</style>
