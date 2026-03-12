import { createI18n } from 'vue-i18n'
import ja from './locales/ja.json'
import en from './locales/en.json'

/** 対応言語 */
export type SupportedLocale = 'ja' | 'en'

/** 端末のロケールから対応言語を検出（未対応は英語にフォールバック） */
export function detectLocale(): SupportedLocale {
  const browserLang = navigator.language?.split('-')[0]
  return browserLang === 'ja' ? 'ja' : 'en'
}

export const i18n = createI18n({
  legacy: false, // Composition API モード
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { ja, en },
})

export default i18n
