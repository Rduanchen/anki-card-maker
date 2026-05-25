import { ref } from 'vue'

const currentTab = ref('translator')
const exportQueue = ref<any[]>([])

export function useApp() {
  return {
    currentTab,
    exportQueue
  }
}
