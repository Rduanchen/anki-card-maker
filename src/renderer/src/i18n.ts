import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US.json'
import zhTW from './locales/zh-TW.json'

const i18n = createI18n({
  legacy: false, // for Composition API
  locale: localStorage.getItem('acm-language') || 'zh-TW',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-TW': zhTW
  }
})

export default i18n
