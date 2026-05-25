<template>
  <div class="translator-layout">
    <div class="translator-body">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="340"
        class="app-sider"
        content-style="padding: 32px 24px; display: flex; flex-direction: column; gap: 24px;"
      >
        <div class="sider-header">
          <h2 class="section-title">{{ $t('nav.translator') }}</h2>
        </div>

        <div class="input-container">
          <dictionary-input
            v-model="words"
            :fetch-autocomplete="fetchAutocomplete"
            @validation="onValidation"
          />
        </div>

        <n-button
          class="submit-btn"
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!isInputValid || isValidationPending || words.length === 0"
          @click="onSubmit"
          block
          strong
        >
          {{ $t('result.submit') }}
        </n-button>
        <n-button
          class="export-btn"
          type="info"
          size="large"
          :disabled="results.length === 0"
          @click="goToExport"
          block
          strong
          style="margin-top: 16px"
        >
          {{ $t('nav.export') }}
        </n-button>
      </n-layout-sider>

      <div class="app-content">
        <div class="content-container">
          <dictionary-result v-model:results="results" :loading="loading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NLayoutSider, NButton } from 'naive-ui'
import { useDictionary } from '../composables/useDictionary'
import DictionaryInput from '../components/DictionaryInput.vue'
import DictionaryResult from '../components/DictionaryResult.vue'
import { useApp } from '../composables/useApp'

const { words, results, loading, fetchAutocomplete, fetchDictionaries } = useDictionary()
const { currentTab, exportQueue } = useApp()
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

const goToExport = () => {
  exportQueue.value = [...results.value]
  currentTab.value = 'ankiexport'
}
</script>

<style scoped>
.translator-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
}

.translator-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.app-sider {
  border-right: 1px solid var(--border-color);
  background: var(--nav-bg);
  flex-shrink: 0;
  height: 100vh;
}

.sider-header {
  margin-bottom: 8px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  color: inherit;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.section-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #8c92a4;
}

.input-container {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px var(--card-shadow);
  border: 1px solid var(--border-color);
}

.submit-btn {
  margin-top: 8px;
  border-radius: 10px;
  font-size: 16px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 14px rgba(24, 160, 88, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 160, 88, 0.4);
}

.submit-btn:active,
.export-btn:active {
  transform: translateY(0);
}

.export-btn {
  border-radius: 10px;
  font-size: 16px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 14px rgba(32, 128, 240, 0.3);
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(32, 128, 240, 0.4);
}

.app-content {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 32px;
  background: transparent;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  min-height: 100%;
  box-shadow: 0 8px 32px var(--card-shadow);
  border: 1px solid var(--border-color);
  padding: 32px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* RWD: Stack layout on small screens */
@media (max-width: 768px) {
  .translator-body {
    flex-direction: column;
  }
  .app-sider {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  .app-content {
    padding: 16px;
  }
  .content-container {
    padding: 16px;
    border-radius: 12px;
  }
}

/* Custom scrollbar for better aesthetics */
:deep(::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}
:deep(::-webkit-scrollbar-track) {
  background: transparent;
}
:deep(::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 4px;
}
:deep(::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}
</style>
