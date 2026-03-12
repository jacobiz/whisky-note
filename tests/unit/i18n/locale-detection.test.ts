import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectLocale } from '@/i18n'

describe('ロケール自動検出', () => {
  const originalLanguage = navigator.language

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('日本語ロケール（ja-JP）→ ja を返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'ja-JP' })
    expect(detectLocale()).toBe('ja')
  })

  it('日本語ロケール（ja）→ ja を返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'ja' })
    expect(detectLocale()).toBe('ja')
  })

  it('英語ロケール（en-US）→ en を返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'en-US' })
    expect(detectLocale()).toBe('en')
  })

  it('英語ロケール（en）→ en を返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'en' })
    expect(detectLocale()).toBe('en')
  })

  it('未対応ロケール（zh-CN）→ en フォールバックを返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'zh-CN' })
    expect(detectLocale()).toBe('en')
  })

  it('未対応ロケール（ko-KR）→ en フォールバックを返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'ko-KR' })
    expect(detectLocale()).toBe('en')
  })

  it('未対応ロケール（fr-FR）→ en フォールバックを返すこと', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'fr-FR' })
    expect(detectLocale()).toBe('en')
  })
})
