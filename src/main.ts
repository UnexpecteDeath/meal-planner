import './styles/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { getEmailConfirmation } from './modules/auth/emailConfirmation'

async function start() {
  const emailConfirmation = await getEmailConfirmation()
  const app = createApp(App, { emailConfirmation })

  app.use(createAppRouter())
  app.use(VueQueryPlugin)

  app.mount('#app')
}

void start()
