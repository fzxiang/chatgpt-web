import { createApp } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import { fetchSSOLogin } from '@/api'
import { LOCAL_NAME } from '@/store/modules/auth/helper'

async function bootstrap() {
  const app = createApp(App)
  setupAssets()

  setupScrollbarStyle()

  setupStore(app)

  setupI18n(app)

  await setupRouter(app)

  app.mount('#app')
}

const parmas = useUrlSearchParams()
const token = localStorage.getItem(LOCAL_NAME)
if (!token && navigator.userAgent.indexOf('wxwork') && !parmas.token)
  fetchSSOLogin()

else
  bootstrap()
