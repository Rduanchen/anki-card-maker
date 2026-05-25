<template>
  <div class="anki-export">
    <div class="header">
      <h2>{{ $t('export.title') }}</h2>
      <n-space align="center">
        <n-tag :type="isAnkiConnected ? 'success' : 'error'">
          {{ isAnkiConnected ? $t('export.connected') : $t('export.disconnected') }}
        </n-tag>
        <n-button @click="fetchDecksAndModels" :loading="loading">{{ $t('export.refresh') }}</n-button>
      </n-space>
    </div>

    <n-card class="settings-panel">
      <n-form inline>
        <n-form-item :label="$t('export.deck')">
          <n-select v-model:value="selectedDeck" :options="deckOptions" style="width: 200px" :placeholder="$t('export.deck_placeholder')" />
        </n-form-item>
        <n-form-item :label="$t('export.model')">
          <n-select v-model:value="selectedModel" :options="modelOptions" style="width: 250px" :placeholder="$t('export.model_placeholder')" />
        </n-form-item>
        <n-form-item v-if="!hasAcmModels()">
          <n-button type="warning" @click="createModels" :loading="loading">
            {{ $t('export.create_models') }}
          </n-button>
        </n-form-item>
      </n-form>
      <div v-if="!hasAcmModels()" class="model-warning">
        {{ $t('export.model_warning') }}
      </div>
    </n-card>

    <div class="export-list">
      <div class="list-header">
        <h3>{{ $t('export.queue_title') }}</h3>
        <n-button type="primary" :disabled="!isAnkiConnected || exportQueue.length === 0" @click="handleBatchExport" :loading="loading">
          {{ $t('export.batch_export') }}
        </n-button>
      </div>
      <div v-if="exportQueue.length === 0" class="empty-state">
        {{ $t('export.queue_empty') }}
      </div>
      <n-list v-else bordered hoverable>
        <n-list-item v-for="(dict, index) in exportQueue" :key="index">
          <template #prefix>
            <div class="word-info">
              <strong>{{ dict.word }}</strong>
              <span class="phonetic" v-if="dict.phonetics?.uk?.ipa">[{{ dict.phonetics.uk.ipa }}]</span>
            </div>
          </template>
          
          <template #suffix>
            <n-button type="primary" :disabled="!isAnkiConnected" @click="handleExport(dict)" :loading="loading">
              {{ $t('export.export_btn') }}
            </n-button>
          </template>
        </n-list-item>
      </n-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NSpace,
  NTag,
  NList,
  NListItem,
  useMessage
} from 'naive-ui'
import { useAnki } from '../composables/useAnki'
import { useApp } from '../composables/useApp'
import { useI18n } from 'vue-i18n'

const message = useMessage()
const { t } = useI18n()

const {
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
} = useAnki()

const { exportQueue } = useApp()

const deckOptions = computed(() => decks.value.map(d => ({ label: d, value: d })))
const modelOptions = computed(() => models.value.map(m => ({ label: m, value: m })))

const formatAnkiFields = (dict: any) => {
  let translationsHtml = ''
  let explanationsHtml = ''

  dict.entries.forEach((entry: any) => {
    translationsHtml += `<div class="pos-group"><b>${entry.pos}</b><ul>`
    explanationsHtml += `<div class="pos-group"><b>${entry.pos}</b><ul>`

    entry.definitions.forEach((def: any) => {
      if (def.translation) {
        translationsHtml += `<li>${def.translation}</li>`
      }
      if (def.explanation) {
        explanationsHtml += `<li><div class="def">${def.explanation}</div>`
        if (def.examples && def.examples.length) {
          explanationsHtml += `<ul class="examples">`
          def.examples.forEach((ex: any) => {
            explanationsHtml += `<li><i>${ex.en}</i><br><small>${ex.translation}</small></li>`
          })
          explanationsHtml += `</ul>`
        }
        explanationsHtml += `</li>`
      }
    })
    translationsHtml += `</ul></div>`
    explanationsHtml += `</ul></div>`
  })

  const phonetics = `UK: ${dict.phonetics?.uk?.ipa || ''} / US: ${dict.phonetics?.us?.ipa || ''}`
  // Prefer UK audio, fallback to US
  const audioUrl = dict.phonetics?.uk?.url || dict.phonetics?.us?.url || ''

  return {
    Word: dict.word,
    Phonetics: phonetics,
    Translations: translationsHtml,
    Explanations: explanationsHtml,
    AudioUrl: audioUrl
  }
}

const handleExport = async (dict: any) => {
  if (!selectedDeck.value || !selectedModel.value) {
    message.error(t('export.select_warning'))
    return
  }

  const parsedData = formatAnkiFields(dict)
  const fields = {
    Word: parsedData.Word,
    Phonetics: parsedData.Phonetics,
    Translations: parsedData.Translations,
    Explanations: parsedData.Explanations
  }

  const result = await addNote(fields, parsedData.AudioUrl)
  if (result.success) {
    message.success(t('export.export_success').replace('{word}', dict.word))
  } else {
    message.error(t('export.export_fail').replace('{error}', result.error))
  }
}

const handleBatchExport = async () => {
  if (!selectedDeck.value || !selectedModel.value) {
    message.error(t('export.select_warning'))
    return
  }
  
  if (exportQueue.value.length === 0) return

  let successCount = 0
  let failCount = 0

  for (const dict of exportQueue.value) {
    const parsedData = formatAnkiFields(dict)
    const fields = {
      Word: parsedData.Word,
      Phonetics: parsedData.Phonetics,
      Translations: parsedData.Translations,
      Explanations: parsedData.Explanations
    }
    const result = await addNote(fields, parsedData.AudioUrl)
    if (result.success) {
      successCount++
    } else {
      failCount++
      console.error(`Export failed for ${dict.word}:`, result.error)
    }
  }

  if (failCount === 0) {
    message.success(t('export.batch_success').replace('{count}', successCount.toString()))
  } else {
    message.warning(t('export.batch_warning').replace('{success}', successCount.toString()).replace('{fail}', failCount.toString()))
  }
}
</script>

<style scoped>
.anki-export {
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
.settings-panel {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--card-shadow);
  background: var(--card-bg);
}
.model-warning {
  color: #d03050;
  font-size: 14px;
  margin-top: 8px;
}
.export-list {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--card-shadow);
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.list-header h3 {
  margin: 0;
  color: var(--text-color);
}
.empty-state {
  color: #8c92a4;
  text-align: center;
  padding: 40px 0;
}
.word-info {
  font-size: 18px;
  color: var(--text-color);
}
.phonetic {
  color: #8c92a4;
  margin-left: 8px;
  font-family: monospace;
}

@media (max-width: 768px) {
  .anki-export {
    padding: 16px;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .export-list {
    padding: 16px;
  }
}
</style>
