import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/db'
import type { SupportedLocale } from '@/i18n'
import { detectLocale, i18n } from '@/i18n'
import type { AppSettings } from '@/db/types'

export const useSettingsStore = defineStore('settings', () => {
  const language = ref<SupportedLocale>('ja')

  /** 起動時に設定を復元し、端末ロケールを初期値とする */
  async function initialize(): Promise<void> {
    const stored = await db.settings.get('settings')
    if (stored) {
      language.value = stored.language
    } else {
      language.value = detectLocale()
      await persist()
    }
    // vue-i18n のロケールを同期
    i18n.global.locale.value = language.value
  }

  /** 言語を変更して即座に全 UI に反映する */
  async function setLanguage(lang: SupportedLocale): Promise<void> {
    language.value = lang
    i18n.global.locale.value = lang
    await persist()
  }

  async function persist(): Promise<void> {
    const settings: AppSettings = { id: 'settings', language: language.value }
    await db.settings.put(settings)
  }

  return { language, initialize, setLanguage }
})
