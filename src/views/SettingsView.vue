<template>
  <div class="min-h-screen bg-surface">
    <!-- ヘッダー -->
    <AppHeader :title="t('settings.title')" :show-back="true" :show-home="true" />

    <!-- 設定一覧 -->
    <main class="p-4 space-y-6 pb-safe">
      <!-- 言語設定 -->
      <section class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
        <h2 class="text-sm font-medium text-ink-secondary uppercase tracking-wider">
          {{ t('settings.language') }}
        </h2>
        <LanguageToggle />
      </section>

      <!-- 情報 -->
      <section class="bg-surface-elevated border border-gold-muted rounded-xl overflow-hidden">
        <h2 class="text-sm font-medium text-ink-secondary uppercase tracking-wider px-4 pt-4 pb-2">
          {{ t('settings.information') }}
        </h2>
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-overlay transition-colors text-left border-t border-gold-muted/30"
          @click="router.push({ name: 'privacy-policy' })"
        >
          <span class="text-ink-primary">{{ t('settings.privacyPolicy') }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-overlay transition-colors text-left border-t border-gold-muted/30"
          @click="router.push({ name: 'licenses' })"
        >
          <span class="text-ink-primary">{{ t('settings.licenses') }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'

const router = useRouter()
const { t } = useI18n()
</script>
