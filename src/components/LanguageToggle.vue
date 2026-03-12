<template>
  <div class="flex items-center gap-1 bg-surface-overlay rounded-lg p-1">
    <button
      v-for="lang in languages"
      :key="lang.code"
      type="button"
      :class="[
        'flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors',
        settingsStore.language === lang.code
          ? 'bg-gold text-surface'
          : 'text-ink-secondary hover:text-ink-primary',
      ]"
      @click="settingsStore.setLanguage(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import type { SupportedLocale } from '@/i18n'

const settingsStore = useSettingsStore()

const languages: { code: SupportedLocale; label: string }[] = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
]
</script>
