<template>
  <div class="dictionary-input">
    <h3>{{ $t('input.title') }}</h3>
    <div class="inputs-container" ref="containerRef">
      <div v-for="(item, index) in wordItems" :key="item.id" class="input-row">
        <div class="status-indicator">
          <span v-if="!item.value.trim()" class="empty"></span>
          <span v-else-if="item.status === 'valid'" class="valid" :title="$t('input.valid')">○</span>
          <span v-else-if="item.status === 'invalid'" class="invalid" :title="$t('input.invalid')">✖</span>
          <n-spin v-else-if="item.status === 'pending'" size="small" :stroke-width="20" class="pending-spin" />
        </div>
        
        <n-auto-complete
          v-model:value="item.value"
          :options="options"
          :loading="isSearching && activeIndex === index"
          @update:value="(val) => handleInput(index, val)"
          @select="(val) => handleSelect(index, val)"
          @update:show="(show: boolean) => { dropdownOpen[index] = show }"
          class="flex-1"
        >
          <template #default="{ handleBlur, handleFocus, handleInput: nHandleInput }">
            <n-input
              :value="item.value"
              type="text"
              :placeholder="$t('input.placeholder')"
              @input="(val) => { item.value = val; nHandleInput(val); handleInput(index, val) }"
              @focus="(e: FocusEvent) => { activeIndex = index; handleFocus(e) }"
              @blur="handleBlur"
              @keydown="(e: KeyboardEvent) => onKeyDown(e, index)"
              :ref="el => setInputRef(el, index)"
            />
          </template>
        </n-auto-complete>
        
        <button class="delete-row-btn" @click="removeRow(index)" v-if="wordItems.length > 1" :title="$t('input.delete_row')">✖</button>
      </div>
    </div>

    <div v-if="invalidWordsList.length > 0" class="validation-error-message">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        <line x1="12" y1="9" x2="12" y2="13" stroke-width="2" stroke-linecap="round"></line>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="3" stroke-linecap="round"></line>
      </svg>
      <span class="error-text">{{ $t('input.invalid_error').replace('{words}', invalidWordsList.join(', ')) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { NAutoComplete, NInput, NSpin } from 'naive-ui'

const props = defineProps<{
  modelValue: string[]
  fetchAutocomplete: (word: string) => Promise<string[]>
}>()

const emit = defineEmits(['update:modelValue', 'validation'])

interface WordItem {
  id: string
  value: string
  status: 'pending' | 'valid' | 'invalid'
}

const wordItems = ref<WordItem[]>([])
const containerRef = ref<HTMLElement | null>(null)
const inputRefs = ref<Record<number, any>>({})

const setInputRef = (el: any, index: number) => {
  if (el) {
    inputRefs.value[index] = el
  } else {
    delete inputRefs.value[index]
  }
}

// Generate unique IDs for list rendering
const generateId = () => Math.random().toString(36).substring(2, 9)

// Initialize items if empty
if (props.modelValue && props.modelValue.length > 0) {
  wordItems.value = props.modelValue.map(val => ({ id: generateId(), value: val, status: 'pending' }))
} else {
  wordItems.value = [{ id: generateId(), value: '', status: 'pending' }]
}

const activeIndex = ref<number | null>(null)
// Track whether the autocomplete dropdown is open per row index
const dropdownOpen = ref<Record<number, boolean>>({})
const options = ref<{ label: string; value: string }[]>([])
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const validationCache = new Map<string, boolean>()
const activeValidations = new Set<string>()

const invalidWordsList = computed(() => {
  return wordItems.value
    .filter((item) => item.value.trim() && item.status === 'invalid')
    .map((item) => item.value.trim())
})

const checkAndEmitValidation = () => {
  const hasPending = wordItems.value.some((item) => item.value.trim() && item.status === 'pending')
  const hasInvalid = invalidWordsList.value.length > 0
  const isValid = !hasPending && !hasInvalid
  
  emit('validation', {
    isValid,
    pending: hasPending,
    invalidWords: invalidWordsList.value
  })
}

const validateWord = async (item: WordItem) => {
  const word = item.value.trim()
  const lowercaseWord = word.toLowerCase()
  
  if (!lowercaseWord) {
    item.status = 'valid' // Empty is considered valid (ignored)
    checkAndEmitValidation()
    return
  }
  
  if (validationCache.has(lowercaseWord)) {
    item.status = validationCache.get(lowercaseWord) ? 'valid' : 'invalid'
    checkAndEmitValidation()
    return
  }
  
  if (activeValidations.has(lowercaseWord)) return
  
  activeValidations.add(lowercaseWord)
  item.status = 'pending'
  
  try {
    const suggestions = await props.fetchAutocomplete(word)
    const exists = suggestions.some((s) => s.trim().toLowerCase() === lowercaseWord)
    
    validationCache.set(lowercaseWord, exists)
    
    if (item.value.trim().toLowerCase() === lowercaseWord) {
      item.status = exists ? 'valid' : 'invalid'
    }
  } catch (e) {
    console.error('Validation error for word:', word, e)
    validationCache.set(lowercaseWord, false)
    if (item.value.trim().toLowerCase() === lowercaseWord) {
      item.status = 'invalid'
    }
  } finally {
    activeValidations.delete(lowercaseWord)
    checkAndEmitValidation()
  }
}

// Watch items to sync with parent modelValue
watch(
  wordItems,
  (newItems) => {
    const lines = newItems.map(item => item.value.trim()).filter(Boolean)
    emit('update:modelValue', lines)
    checkAndEmitValidation()
  },
  { deep: true }
)

// Initial validation
wordItems.value.forEach(item => {
  if (item.value.trim()) validateWord(item)
})

const handleInput = (index: number, val: string) => {
  const item = wordItems.value[index]
  if (!item) return
  
  item.status = 'pending'
  validateWord(item)
  
  handleSearch(val)
}

const handleSelect = (index: number, val: string) => {
  const item = wordItems.value[index]
  if (item) {
    item.value = val
    item.status = 'pending'
    validateWord(item)
  }
  options.value = []
  
  // Refocus
  nextTick(() => {
    focusInput(index)
  })
}

const handleEnter = (index: number) => {
  // Insert a new row below the current one
  const newItem = { id: generateId(), value: '', status: 'pending' as const }
  wordItems.value.splice(index + 1, 0, newItem)
  
  // Focus the new row
  nextTick(() => {
    focusInput(index + 1)
    
    // Scroll to the bottom or to the new element
    if (containerRef.value) {
      const container = containerRef.value
      container.scrollTop = container.scrollHeight
    }
  })
}

// Unified keydown handler: do not intercept when dropdown is open so Naive UI
// can handle ArrowUp / ArrowDown / Enter for list navigation natively.
// When closed, Enter adds a new row and arrows move focus between rows.
const onKeyDown = (e: KeyboardEvent, index: number) => {
  const isOpen = !!dropdownOpen.value[index]

  if (isOpen) {
    // Do NOT preventDefault — let the event bubble to n-auto-complete's internal listener
    return
  }

  // Dropdown closed — our own keyboard shortcuts
  if (e.key === 'Enter') {
    e.preventDefault()
    handleEnter(index)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusInput(index + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusInput(index - 1)
  }
}

const removeRow = (index: number) => {
  wordItems.value.splice(index, 1)
}

const focusInput = (index: number) => {
  const inputCmp = inputRefs.value[index]
  if (inputCmp && typeof inputCmp.focus === 'function') {
    inputCmp.focus()
  } else if (inputCmp && inputCmp.$el) {
    const inputEl = inputCmp.$el.querySelector('input')
    if (inputEl) inputEl.focus()
  }
}

const handleSearch = (query: string) => {
  if (!query || !query.trim()) {
    options.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    try {
      const res = await props.fetchAutocomplete(query)
      options.value = res.map((word) => ({ label: word, value: word }))
    } catch (e) {
      console.error(e)
    } finally {
      isSearching.value = false
    }
  }, 300)
}
</script>

<style scoped>
.dictionary-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.dictionary-input h3 {
  margin: 0;
  color: var(--text-color);
}

.inputs-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Fixed height and scrollable when items grow */
  max-height: 40vh;
  min-height: 200px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-bg);
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 1px 2px var(--card-shadow);
}

.status-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: bold;
}

.status-indicator .valid {
  color: #10b981; /* Green circle */
}

.status-indicator .invalid {
  color: #ef4444; /* Red cross */
}

.status-indicator .empty {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 50%;
}

.pending-spin {
  transform: scale(0.6);
}

.flex-1 {
  flex: 1;
}

.delete-row-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-row-btn:hover {
  color: #ef4444;
  background: #fee2e2;
}

/* Scrollbar styles for inputs container */
.inputs-container::-webkit-scrollbar {
  width: 6px;
}
.inputs-container::-webkit-scrollbar-track {
  background: transparent;
}
.inputs-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.validation-error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  transition: all 0.3s ease;
  animation: slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.error-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #ef4444;
}

.error-text {
  line-height: 1.4;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

