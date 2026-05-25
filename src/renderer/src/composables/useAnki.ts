import { ref, watch, onMounted } from 'vue'

export function useAnki() {
  const decks = ref<string[]>([])
  const models = ref<string[]>([])
  const loading = ref(false)
  const isAnkiConnected = ref(true)

  const selectedDeck = ref<string | null>(localStorage.getItem('anki-deck'))
  const selectedModel = ref<string>('ACM_Type1_EN2ZH') // Default to Type 1

  watch(selectedDeck, (newVal) => {
    if (newVal) {
      localStorage.setItem('anki-deck', newVal)
    }
  })

  const fetchDecksAndModels = async () => {
    loading.value = true
    try {
      const decksRes = await (window as any).api.anki.getDecks()
      const modelsRes = await (window as any).api.anki.getModels()

      if (decksRes.success) {
        decks.value = decksRes.data
        if (decks.value.length > 0 && (!selectedDeck.value || !decks.value.includes(selectedDeck.value))) {
          selectedDeck.value = decks.value[0]
        }
      } else {
        isAnkiConnected.value = false
      }

      if (modelsRes.success) {
        models.value = modelsRes.data
      } else {
        isAnkiConnected.value = false
      }
    } catch (e) {
      isAnkiConnected.value = false
      console.error('Anki Connect Error:', e)
    } finally {
      loading.value = false
    }
  }

  const createModels = async () => {
    loading.value = true
    try {
      const res = await (window as any).api.anki.createModels()
      if (res.success) {
        await fetchDecksAndModels() // Refresh models
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to create models:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  const hasAcmModels = () => {
    return models.value.includes('ACM_Type1_EN2ZH') && models.value.includes('ACM_Type2_ZH2EN')
  }

  const addNote = async (fields: Record<string, string>, audioUrl?: string) => {
    if (!selectedDeck.value || !selectedModel.value) return { success: false, error: 'Deck or Model not selected' }
    
    loading.value = true
    try {
      const res = await (window as any).api.anki.addNote(selectedDeck.value, selectedModel.value, fields, audioUrl)
      return res
    } catch (e: any) {
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDecksAndModels()
  })

  return {
    decks,
    models,
    loading,
    isAnkiConnected,
    selectedDeck,
    selectedModel,
    fetchDecksAndModels,
    createModels,
    hasAcmModels,
    addNote
  }
}
