<template>
  <div class="error-page">
    <img src="/svg/404.svg" class="error-page-img" alt="">
    <p class="error-text">
      Maalesef, aradığınız içerik bulunamadı veya silinmiş olabilir.
    </p>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage'
}
</script>
<style>
.error-page-img {
  max-width: 600px;
}
.error-page {
  text-align: center;
}
</style>
