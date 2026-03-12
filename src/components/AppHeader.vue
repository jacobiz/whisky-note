<template>
  <header
    class="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-gold-muted px-4 py-3 flex items-center gap-3"
    style="padding-top: calc(0.75rem + env(safe-area-inset-top))"
  >
    <!-- 戻るボタン -->
    <button
      v-if="showBack"
      type="button"
      class="p-1 text-ink-secondary hover:text-gold transition-colors shrink-0"
      :aria-label="t('common.back')"
      @click="handleBack"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <!-- スペーサー（戻るボタンなしの場合） -->
    <div v-else class="w-8 shrink-0" />

    <!-- タイトル -->
    <h1 class="flex-1 text-lg font-semibold text-ink-primary truncate">{{ title }}</h1>

    <!-- アクションスロット（追加ボタン領域） -->
    <slot name="actions" />

    <!-- ホームアイコン -->
    <button
      v-if="showHome"
      type="button"
      class="p-1 text-ink-secondary hover:text-gold transition-colors shrink-0"
      :aria-label="t('common.home')"
      @click="handleHome"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </button>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface Props {
  title: string
  showBack?: boolean
  showHome?: boolean
  onBack?: () => void
  onHome?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showHome: true,
})

const router = useRouter()
const { t } = useI18n()

function handleBack(): void {
  if (props.onBack) {
    props.onBack()
  } else {
    router.back()
  }
}

function handleHome(): void {
  if (props.onHome) {
    props.onHome()
  } else {
    router.push({ name: 'home' })
  }
}
</script>
