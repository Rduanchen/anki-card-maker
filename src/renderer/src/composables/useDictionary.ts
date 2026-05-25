import { ref, watch, onMounted } from 'vue'

const words = ref<string[]>([])
const results = ref<any[]>([])
const history = ref<any[]>([])
const loading = ref(false)

// Default Settings
const defaultSettings = {
  phonetics: {
    source: 'both' as 'uk' | 'us' | 'both',
    displayIpa: true,
    displayAudio: true
  },
  displayConfig: {
    maxDefinitions: undefined as number | undefined,
    maxExamplesPerDefinition: undefined as number | undefined,
    visibility: {
      domain: true,
      explanation: true,
      translation: true,
      examples: true,
      exampleTranslation: true,
      synonyms: true,
      antonyms: true
    }
  }
}

const dictionarySettings = ref(JSON.parse(JSON.stringify(defaultSettings)))

export function useDictionary() {

  // Load from localStorage on mount
  onMounted(() => {
    const savedSettings = localStorage.getItem('dictionary-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        // Merge with defaults to ensure all fields exist
        dictionarySettings.value = {
          ...defaultSettings,
          ...parsed,
          phonetics: { ...defaultSettings.phonetics, ...(parsed.phonetics || {}) },
          displayConfig: {
            ...defaultSettings.displayConfig,
            ...(parsed.displayConfig || {}),
            visibility: { ...defaultSettings.displayConfig.visibility, ...(parsed.displayConfig?.visibility || {}) }
          }
        }
      } catch (e) {
        console.error('Failed to parse saved settings', e)
      }
    }

    const savedHistory = localStorage.getItem('dictionary-history')
    if (savedHistory) {
      try {
        history.value = JSON.parse(savedHistory)
      } catch (e) {
        console.error('Failed to parse history', e)
      }
    }
  })

  // Watch and save to localStorage
  watch(dictionarySettings, (newVal) => {
    localStorage.setItem('dictionary-settings', JSON.stringify(newVal))
  }, { deep: true })

  watch(history, (newVal) => {
    localStorage.setItem('dictionary-history', JSON.stringify(newVal))
  }, { deep: true })

  const fetchAutocomplete = async (word: string) => {
    if (!word) return []
    try {
      const res = await (window as any).api.dictionary.autocomplete(word)
      return res
    } catch (e) {
      console.error('Autocomplete Error:', e)
      return []
    }
  }

  const fetchDictionaries = async (searchWords: string[]) => {
    loading.value = true
    try {
      // Create a plain copy of the array to avoid "An object could not be cloned" error with Vue Proxies in IPC
      const plainWords = JSON.parse(JSON.stringify(searchWords))
      const plainSettings = JSON.parse(JSON.stringify(dictionarySettings.value))
      
      const res = await (window as any).api.dictionary.getDictionaries(plainWords, plainSettings)
      
      // Update current results
      results.value = res.dictionaries
      
      // Update history: filter duplicates and prepend
      const newWords = res.dictionaries.map((d: any) => d.word)
      const filteredExisting = history.value.filter(d => !newWords.includes(d.word))
      history.value = [...res.dictionaries, ...filteredExisting].slice(0, 50) // Keep up to 50
    } catch (e) {
      console.error('Fetch Dictionaries Error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    words,
    results,
    history,
    loading,
    dictionarySettings,
    fetchAutocomplete,
    fetchDictionaries
  }
}
