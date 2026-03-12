<template>
  <div class="min-h-screen bg-surface">
    <AppHeader :title="t('settings.privacyPolicy')" :show-back="true" :show-home="true" />

    <main class="p-4 space-y-4 pb-safe">
      <section class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
        <p class="text-ink-primary leading-relaxed">{{ t('settings.privacyPolicyP1') }}</p>
        <p class="text-ink-primary leading-relaxed">{{ t('settings.privacyPolicyP2') }}</p>
        <p class="text-ink-primary leading-relaxed">{{ t('settings.privacyPolicyP3') }}</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'

const { t } = useI18n()
</script>
