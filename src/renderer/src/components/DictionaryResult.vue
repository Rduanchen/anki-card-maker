<template>
  <div class="dictionary-result">
    <div v-if="loading" class="loading">載入中... (Loading...)</div>
    <div v-else-if="!results || results.length === 0" class="empty">暫無查詢結果 (No results yet)</div>
    <div v-else class="results-container">
      <div v-for="(dict, index) in results" :key="index" class="dict-card">
        <div class="dict-header">
          <div class="dict-title" @click="toggleCollapse(index)">
            <span class="collapse-icon">{{ collapsed[index] ? '▶' : '▼' }}</span>
            <span v-if="editing.word !== index" @dblclick.stop="startEdit('word', index)">{{ dict.word }}</span>
            <input v-else v-model="dict.word" @blur="stopEdit" @keyup.enter="stopEdit" @click.stop class="edit-input title-input" />
          </div>
          <button class="delete-btn" @click.stop="deleteCard(index)" :title="$t('result.delete_card')">✖</button>
        </div>
        
        <div v-show="!collapsed[index]" class="dict-body">
          <div class="phonetics">
            <span v-if="dict.phonetics?.uk?.ipa">
              UK: {{ dict.phonetics.uk.ipa }}
              <button v-if="dict.phonetics.uk.url" class="audio-btn" @click.stop="playAudio(dict.phonetics.uk.url)" :title="$t('result.play_uk')">🔊</button>
            </span>
            <span v-if="dict.phonetics?.us?.ipa" style="margin-left: 12px;">
              US: {{ dict.phonetics.us.ipa }}
              <button v-if="dict.phonetics.us.url" class="audio-btn" @click.stop="playAudio(dict.phonetics.us.url)" :title="$t('result.play_us')">🔊</button>
            </span>
          </div>
          <div class="entries">
            <div v-for="(entry, eIdx) in dict.entries" :key="eIdx" class="entry">
              <div class="entry-header">
                <h4 v-if="editing.pos !== `${index}-${eIdx}`" class="pos" @dblclick="startEdit('pos', `${index}-${eIdx}`)">{{ entry.pos }}</h4>
                <input v-else v-model="entry.pos" @blur="stopEdit" @keyup.enter="stopEdit" class="edit-input pos-input" />
                <button class="delete-btn small" @click="deleteEntry(index, eIdx)" :title="$t('result.delete_pos')">✖</button>
              </div>

              <div v-for="(def, dIdx) in entry.definitions" :key="dIdx" class="definition">
                <div class="def-header">
                  <button class="delete-btn small" @click="deleteDef(index, eIdx, dIdx)" :title="$t('result.delete_def')">✖</button>
                </div>
                <p class="explanation">
                  <strong>{{ $t('result.explanation') }}</strong> 
                  <span v-if="editing.exp !== `${index}-${eIdx}-${dIdx}`" class="editable-text" @dblclick="startEdit('exp', `${index}-${eIdx}-${dIdx}`)">{{ def.explanation }}</span>
                  <textarea v-else v-model="def.explanation" @blur="stopEdit" class="edit-input textarea-input"></textarea>
                </p>
                <p class="translation">
                  <strong>{{ $t('result.translation') }}</strong> 
                  <span v-if="editing.trans !== `${index}-${eIdx}-${dIdx}`" class="editable-text" @dblclick="startEdit('trans', `${index}-${eIdx}-${dIdx}`)">{{ def.translation }}</span>
                  <textarea v-else v-model="def.translation" @blur="stopEdit" class="edit-input textarea-input"></textarea>
                </p>
                
                <div v-if="def.examples && def.examples.length" class="examples">
                  <ul>
                    <li v-for="(ex, exIdx) in def.examples" :key="exIdx" class="example-item">
                      <div class="ex-content">
                        <p class="ex-en">
                          <span v-if="editing.ex_en !== `${index}-${eIdx}-${dIdx}-${exIdx}`" class="editable-text" @dblclick="startEdit('ex_en', `${index}-${eIdx}-${dIdx}-${exIdx}`)">{{ ex.en }}</span>
                          <textarea v-else v-model="ex.en" @blur="stopEdit" class="edit-input textarea-input"></textarea>
                        </p>
                        <p class="ex-zh">
                          <span v-if="editing.ex_zh !== `${index}-${eIdx}-${dIdx}-${exIdx}`" class="editable-text" @dblclick="startEdit('ex_zh', `${index}-${eIdx}-${dIdx}-${exIdx}`)">{{ ex.translation }}</span>
                          <textarea v-else v-model="ex.translation" @blur="stopEdit" class="edit-input textarea-input"></textarea>
                        </p>
                      </div>
                      <button class="delete-btn small ex-delete" @click="deleteExample(index, eIdx, dIdx, exIdx)" :title="$t('result.delete_ex')">✖</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const results = defineModel<any[]>('results', { required: true })
defineProps<{
  loading: boolean
}>()

const collapsed = ref<Record<number, boolean>>({})

watch(() => results.value, () => {
  const newCollapsed: Record<number, boolean> = {}
  results.value.forEach((_, index) => {
    newCollapsed[index] = index !== 0
  })
  collapsed.value = newCollapsed
}, { deep: true, immediate: true })

const toggleCollapse = (index: number) => {
  collapsed.value[index] = !collapsed.value[index]
}

const playAudio = (url: string) => {
  if (!url) return
  const audio = new Audio(url)
  audio.play().catch(e => console.error("Audio play failed:", e))
}

const editing = ref<{
  word: number | null,
  pos: string | null,
  exp: string | null,
  trans: string | null,
  ex_en: string | null,
  ex_zh: string | null
}>({
  word: null,
  pos: null,
  exp: null,
  trans: null,
  ex_en: null,
  ex_zh: null
})

const startEdit = (field: keyof typeof editing.value, id: any) => {
  editing.value[field] = id
}

const stopEdit = () => {
  editing.value = {
    word: null,
    pos: null,
    exp: null,
    trans: null,
    ex_en: null,
    ex_zh: null
  }
}

const deleteCard = (index: number) => {
  results.value.splice(index, 1)
}

const deleteEntry = (index: number, eIdx: any) => {
  results.value[index].entries.splice(Number(eIdx), 1)
}

const deleteDef = (index: number, eIdx: any, dIdx: any) => {
  results.value[index].entries[Number(eIdx)].definitions.splice(Number(dIdx), 1)
}

const deleteExample = (index: number, eIdx: any, dIdx: any, exIdx: any) => {
  results.value[index].entries[Number(eIdx)].definitions[Number(dIdx)].examples.splice(Number(exIdx), 1)
}
</script>

<style scoped>
.dictionary-result {
  height: 100%;
}
.loading, .empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-color);
  font-size: 16px;
  opacity: 0.7;
}
.dict-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  background: var(--card-bg);
  box-shadow: 0 2px 4px var(--card-shadow);
  transition: all 0.2s ease;
}
.dict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.dict-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
}
.collapse-icon {
  font-size: 14px;
  margin-right: 12px;
  color: #999;
}
.dict-body {
  margin-top: 16px;
}
.phonetics {
  color: #666;
  margin-bottom: 16px;
  font-family: monospace;
  display: flex;
}
.audio-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-left: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: transform 0.2s, background-color 0.2s;
  color: inherit;
}
.audio-btn:hover {
  background-color: var(--bg-color);
  transform: scale(1.1);
}
.audio-btn:active {
  transform: scale(0.95);
}
.entry {
  margin-bottom: 16px;
}
.entry-header {
  display: flex;
  align-items: center;
  margin: 8px 0;
}
.pos {
  color: #2080f0;
  font-size: 16px;
  text-transform: capitalize;
  margin: 0;
  margin-right: 8px;
}
.definition {
  margin-left: 16px;
  margin-bottom: 16px;
  border-left: 3px solid var(--border-color);
  padding-left: 16px;
  position: relative;
}
.def-header {
  position: absolute;
  left: -10px;
  top: 0;
  transform: translateX(-100%);
  opacity: 0;
  transition: opacity 0.2s;
}
.definition:hover .def-header {
  opacity: 1;
}
.explanation, .translation {
  margin: 4px 0;
  line-height: 1.5;
  color: var(--text-color);
}
.examples {
  background: var(--bg-color);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}
ul {
  padding-left: 20px;
  margin: 4px 0;
}
.example-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  position: relative;
}
.ex-content {
  flex: 1;
}
.ex-delete {
  opacity: 0;
  transition: opacity 0.2s;
}
.example-item:hover .ex-delete {
  opacity: 1;
}
.ex-en {
  margin: 0;
  font-style: italic;
  color: var(--text-color);
}
.ex-zh {
  margin: 0;
  color: #666;
  font-size: 14px;
}
.editable-text {
  cursor: text;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;
}
.editable-text:hover {
  border-bottom-color: #ccc;
  background-color: var(--bg-color);
}
.edit-input {
  border: 1px solid #2080f0;
  border-radius: 4px;
  padding: 4px;
  font-family: inherit;
  font-size: inherit;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--card-bg);
  color: var(--text-color);
}
.title-input {
  font-size: 24px;
  font-weight: bold;
  width: auto;
}
.pos-input {
  color: #2080f0;
  width: auto;
}
.textarea-input {
  resize: vertical;
  min-height: 60px;
}
.delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
}
.delete-btn:hover {
  color: #d03050;
  background-color: var(--bg-color);
}
.delete-btn.small {
  font-size: 12px;
  padding: 2px 4px;
}
</style>
