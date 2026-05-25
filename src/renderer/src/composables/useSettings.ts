import { ref, watch } from 'vue'
import i18n from '../i18n'

export function useSettings() {
  const theme = ref<'light' | 'dark'>((localStorage.getItem('acm-theme') as 'light' | 'dark') || 'light')
  const language = ref<string>(localStorage.getItem('acm-language') || 'zh-TW')

  watch(theme, (newTheme) => {
    localStorage.setItem('acm-theme', newTheme)
    if (newTheme === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, { immediate: true })

  watch(language, (newLang) => {
    localStorage.setItem('acm-language', newLang)
    // Update vue-i18n locale
    ;(i18n.global.locale as any).value = newLang
  })

  return {
    theme,
    language
  }
}
