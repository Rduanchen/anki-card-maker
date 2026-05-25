<template>
  <div class="history-page">
    <div class="header">
      <h2>{{ $t('nav.history') }}</h2>
      <n-button type="error" ghost @click="clearHistory" :disabled="history.length === 0">
        {{ $t('history.clear') }}
      </n-button>
    </div>
    
    <div class="content-container">
      <dictionary-result 
        v-model:results="history" 
        :loading="false" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useDictionary } from '../composables/useDictionary'
import DictionaryResult from '../components/DictionaryResult.vue'

const { history } = useDictionary()

const clearHistory = () => {
  history.value = []
}
</script>

<style scoped>
.history-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: var(--text-color);
}

.content-container {
  background: transparent;
}

@media (max-width: 768px) {
  .history-page {
    padding: 16px;
  }
}
</style>
