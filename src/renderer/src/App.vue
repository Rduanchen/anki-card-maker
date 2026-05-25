<template>
  <n-config-provider :theme="theme === 'dark' ? darkTheme : null">
    <n-message-provider>
      <div class="app-container">
        <!-- Custom header bar: fully controlled by us, not by n-tabs slots -->
        <header class="app-header">
          <!-- Left: Logo + Title -->
          <div class="header-left">
            <div class="logo">A</div>
            <h1 class="app-title">Anki Card Maker</h1>
          </div>

          <!-- Center: Tab navigation buttons -->
          <nav class="header-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="tab-btn"
              :class="{ active: currentTab === tab.value }"
              @click="currentTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </nav>

          <!-- Right: Settings controls -->
          <div class="header-right">
            <n-switch v-model:value="isDark" :rail-style="railStyle">
              <template #checked>🌙</template>
              <template #unchecked>☀️</template>
            </n-switch>
            <n-select
              v-model:value="language"
              :options="langOptions"
              size="small"
              style="width: 100px"
            />
            <button class="settings-btn" @click="showSettings = true" title="設定">⚙️</button>
          </div>
        </header>

        <!-- Tab content area -->
        <main class="app-content">
          <translator v-show="currentTab === 'translator'" />
          <history v-show="currentTab === 'history'" />
          <anki-export v-show="currentTab === 'ankiexport'" />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
  <settings-modal v-model:show="showSettings" :settings="dictionarySettings" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NConfigProvider, NMessageProvider, darkTheme, NSwitch, NSelect } from 'naive-ui'
import Translator from './views/Translator.vue'
import History from './views/History.vue'
import AnkiExport from './views/AnkiExport.vue'
import SettingsModal from './components/SettingsModal.vue'
import { useApp } from './composables/useApp'
import { useSettings } from './composables/useSettings'
import { useDictionary } from './composables/useDictionary'

const { dictionarySettings } = useDictionary()
const { currentTab } = useApp()
const { theme, language } = useSettings()
const { t } = useI18n()
const showSettings = ref(false)

const isDark = computed({
  get: () => theme.value === 'dark',
  set: (val) => {
    theme.value = val ? 'dark' : 'light'
  }
})

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
  const style: any = {}
  if (checked) {
    style.background = '#2080f0'
  }
  if (focused) {
    style.boxShadow = '0 0 0 2px #2080f040'
  }
  return style
}

const langOptions = [
  { label: 'English', value: 'en-US' },
  { label: '繁體中文', value: 'zh-TW' }
]

const tabs = computed(() => [
  { value: 'translator', label: t('nav.translator') },
  { value: 'history', label: t('nav.history') },
  { value: 'ankiexport', label: t('nav.export') }
])
</script>

<style>
:root {
  --bg-color: #f0f2f5;
  --nav-bg: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
  --card-bg: #ffffff;
  --card-shadow: rgba(0, 0, 0, 0.05);
  --tab-active-bg: #18a058;
  --tab-active-text: #ffffff;
  --tab-hover-bg: rgba(24, 160, 88, 0.08);
}

body.dark {
  --bg-color: #101014;
  --nav-bg: #18181c;
  --text-color: #e0e0e0;
  --border-color: #2d2d30;
  --card-bg: #18181c;
  --card-shadow: rgba(0, 0, 0, 0.5);
  --tab-active-bg: #18a058;
  --tab-active-text: #ffffff;
  --tab-hover-bg: rgba(24, 160, 88, 0.15);
}

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition:
    background-color 0.3s,
    color 0.3s;
}

/* ── App shell ─────────────────────────────────────────────── */
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ────────────────────────────────────────────────── */
.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 56px;
  flex-shrink: 0;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border-color);
  transition:
    background-color 0.3s,
    border-color 0.3s;
  z-index: 100;
}

/* Left: logo + title */
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.3);
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: inherit;
  white-space: nowrap;
}

/* Center: tabs */
.header-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;
  font-family: inherit;
}

.tab-btn:hover {
  background: var(--tab-hover-bg);
  color: #18a058;
}

.tab-btn.active {
  background: var(--tab-active-bg);
  color: var(--tab-active-text);
  font-weight: 600;
}

/* Right: controls */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.15s;
  line-height: 1;
}

.settings-btn:hover {
  background: var(--tab-hover-bg);
  transform: rotate(30deg);
}

/* ── Content area ──────────────────────────────────────────── */
.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.app-content > * {
  position: absolute;
  inset: 0;
  overflow: auto;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 600px) {
  .app-header {
    padding: 0 12px;
    gap: 8px;
  }
  .app-title {
    display: none;
  }
  .header-tabs {
    gap: 2px;
  }
  .tab-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
  .header-right {
    gap: 6px;
  }
}
</style>
