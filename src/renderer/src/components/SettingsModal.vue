<template>
  <n-modal v-model:show="showModal">
    <n-card
      class="settings-card"
      title="字典設定 (Dictionary Settings)"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-form
        :model="settings"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-divider title-placement="left" class="section-divider">發音與音標 (Phonetics)</n-divider>

        <div class="settings-group">
          <n-form-item label="發音來源 (Source)">
            <n-select v-model:value="settings.phonetics.source" :options="sourceOptions" />
          </n-form-item>
          <n-form-item label="顯示音標 (Display IPA)">
            <n-switch v-model:value="settings.phonetics.displayIpa" />
          </n-form-item>
          <n-form-item label="顯示語音 (Display Audio)">
            <n-switch v-model:value="settings.phonetics.displayAudio" />
          </n-form-item>
        </div>

        <n-divider title-placement="left" class="section-divider"
          >顯示設定 (Display Config)</n-divider
        >

        <div class="settings-group">
          <n-form-item label="最大釋義數量 (Max Definitions)">
            <n-input-number
              v-model:value="settings.displayConfig.maxDefinitions"
              clearable
              placeholder="不限制"
              :min="1"
            />
          </n-form-item>
          <n-form-item label="每釋義最大例句數量 (Max Examples)">
            <n-input-number
              v-model:value="settings.displayConfig.maxExamplesPerDefinition"
              clearable
              placeholder="不限制"
              :min="0"
            />
          </n-form-item>
        </div>

        <n-divider title-placement="left" class="section-divider">可見性 (Visibility)</n-divider>

        <div class="visibility-grid">
          <n-form-item label="領域 (Domain)">
            <n-switch v-model:value="settings.displayConfig.visibility.domain" />
          </n-form-item>
          <n-form-item label="解釋 (Explanation)">
            <n-switch v-model:value="settings.displayConfig.visibility.explanation" />
          </n-form-item>
          <n-form-item label="翻譯 (Translation)">
            <n-switch v-model:value="settings.displayConfig.visibility.translation" />
          </n-form-item>
          <n-form-item label="同義詞 (Synonyms)">
            <n-switch v-model:value="settings.displayConfig.visibility.synonyms" />
          </n-form-item>
          <n-form-item label="反義詞 (Antonyms)">
            <n-switch v-model:value="settings.displayConfig.visibility.antonyms" />
          </n-form-item>
          <n-form-item label="例句 (Examples)">
            <n-switch v-model:value="settings.displayConfig.visibility.examples" />
          </n-form-item>
          <n-form-item label="例句翻譯 (Example Trans)">
            <n-switch v-model:value="settings.displayConfig.visibility.exampleTranslation" />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button type="primary" size="large" @click="showModal = false">完成 (Done)</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  NModal,
  NCard,
  NForm,
  NFormItem,
  NSwitch,
  NSelect,
  NInputNumber,
  NDivider,
  NButton
} from 'naive-ui'

const props = defineProps<{
  show: boolean
  settings: any
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const sourceOptions = [
  { label: '皆顯示 (Both)', value: 'both' },
  { label: '僅英式 (UK)', value: 'uk' },
  { label: '僅美式 (US)', value: 'us' }
]
</script>

<style scoped>
.settings-card {
  width: 90vw;
  max-width: 540px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.visibility-grid {
  display: grid;
  grid-template-columns: 1fr;
}

.section-divider {
  margin-top: 16px;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

/* Custom scrollbar for webkit browsers */
.settings-card::-webkit-scrollbar {
  width: 8px;
}
.settings-card::-webkit-scrollbar-track {
  background: transparent;
}
.settings-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.settings-card::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 480px) {
  .settings-card {
    width: 95vw;
  }

  .visibility-grid {
    grid-template-columns: 1fr;
  }

  /* On very small screens, form items usually switch to top placement naturally if configured, 
     but keeping it left might squeeze the toggle switch. The auto-fill will handle 1 column. */
}
</style>
