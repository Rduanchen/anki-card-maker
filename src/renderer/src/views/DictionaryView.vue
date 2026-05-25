<template>
  <div class="dictionary-view">
    <div class="header">
      <n-button 
        type="primary" 
        size="large" 
        :loading="loading" 
        :disabled="!isInputValid || isValidationPending || words.length === 0"
        @click="onSubmit"
      >
        查詢翻譯 (Submit)
      </n-button>
    </div>
    <div class="content">
      <div class="left-panel">
        <dictionary-input 
          v-model="words" 
          :fetch-autocomplete="fetchAutocomplete" 
          @validation="onValidation"
        />
      </div>
      <div class="right-panel">
        <dictionary-result v-model:results="results" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { useDictionary } from '../composables/useDictionary'
import DictionaryInput from '../components/DictionaryInput.vue'
import DictionaryResult from '../components/DictionaryResult.vue'

const { words, results, loading, fetchAutocomplete, fetchDictionaries } = useDictionary()

const isInputValid = ref(true)
const isValidationPending = ref(false)

const onValidation = (status: { isValid: boolean; pending: boolean }) => {
  isInputValid.value = status.isValid
  isValidationPending.value = status.pending
}

const onSubmit = () => {
  if (words.value.length > 0 && isInputValid.value && !isValidationPending.value) {
    fetchDictionaries(words.value)
  }
}
</script>

<style scoped>
.dictionary-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background-color: var(--bg-color);
}
.header {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;
}
.content {
  display: flex;
  flex: 1;
  gap: 24px;
  overflow: hidden;
  min-height: 0;
}
.left-panel {
  flex: 0 0 30%;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px var(--card-shadow);
  overflow-y: auto;
}
.right-panel {
  flex: 1;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px var(--card-shadow);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  .left-panel {
    flex: none;
  }
}
</style>
