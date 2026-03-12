<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <header class="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-gold-muted px-4 py-3 flex items-center gap-3">
      <button
        type="button"
        class="p-1 text-ink-secondary hover:text-gold transition-colors"
        :aria-label="t('common.back')"
        @click="router.back()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-lg font-semibold text-ink-primary">{{ t('settings.title') }}</h1>
    </header>

    <!-- 設定一覧 -->
    <main class="p-4 space-y-6">
      <!-- 言語設定 -->
      <section class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
        <h2 class="text-sm font-medium text-ink-secondary uppercase tracking-wider">
          {{ t('settings.language') }}
        </h2>
        <LanguageToggle />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageToggle from '@/components/LanguageToggle.vue'

const router = useRouter()
const { t } = useI18n()
</script>
