<template>
  <div class="min-h-screen bg-surface">
    <AppHeader :title="t('settings.privacyPolicy')" :show-back="true" :show-home="true" />

    <main class="p-4 space-y-4 pb-safe">
      <section class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
        <h2 class="text-sm font-medium text-gold uppercase tracking-wider">{{ t('settings.privacyPolicy') }}</h2>
        <p class="text-ink-primary leading-relaxed">
          このアプリは、すべてのデータをお使いのデバイス上にローカル保存します。
          外部サーバーへのデータ送信や収集は一切行いません。
        </p>
        <p class="text-ink-primary leading-relaxed">
          入力されたテイスティングノート・画像データはIndexedDB（ブラウザ内ストレージ）にのみ保存され、
          インターネット経由で外部に転送されることはありません。
        </p>
        <p class="text-ink-primary leading-relaxed">
          本アプリはオフライン環境でも動作するPWA（Progressive Web App）であり、
          ユーザーのプライバシーを最優先に設計されています。
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'

const { t } = useI18n()
</script>
