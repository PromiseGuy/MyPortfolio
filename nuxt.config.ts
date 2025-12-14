// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@unocss/nuxt', '@tresjs/nuxt', '@nuxt/icon'],
  css: ['@outloud/css/reset.css', '@/assets/scss/main.scss'],
  typescript: {
    strict: true,
    typeCheck: false,
  }
})