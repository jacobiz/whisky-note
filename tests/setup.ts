import '@testing-library/jest-dom'
import { vi } from 'vitest'

// IndexedDB のモック（jsdom は IndexedDB を持たないため）
import 'fake-indexeddb/auto'

// crypto.randomUUID のモック
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2)}`,
  },
})

// navigator.language のデフォルト
Object.defineProperty(navigator, 'language', {
  value: 'ja-JP',
  configurable: true,
})
