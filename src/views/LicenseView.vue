<template>
  <div class="min-h-screen bg-surface">
    <AppHeader :title="t('settings.licenses')" :show-back="true" :show-home="true" />

    <main class="p-4 space-y-4 pb-safe">
      <section class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
        <h2 class="text-sm font-medium text-gold uppercase tracking-wider">{{ t('settings.licenses') }}</h2>
        <p class="text-xs text-ink-muted">このアプリは以下のオープンソースライブラリを使用しています。</p>
        <ul class="space-y-2">
          <li v-for="lib in libraries" :key="lib.name" class="flex justify-between items-center">
            <span class="text-ink-primary font-medium">{{ lib.name }}</span>
            <span class="text-xs text-ink-muted">{{ lib.license }}</span>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'

const { t } = useI18n()

const libraries = [
  { name: 'Vue', license: 'MIT' },
  { name: 'Pinia', license: 'MIT' },
  { name: 'Vue Router', license: 'MIT' },
  { name: 'vue-i18n', license: 'MIT' },
  { name: 'Vite', license: 'MIT' },
  { name: 'Dexie.js', license: 'Apache-2.0' },
  { name: 'Tailwind CSS', license: 'MIT' },
  { name: 'browser-image-compression', license: 'MIT' },
  { name: 'vite-plugin-pwa', license: 'MIT' },
  { name: 'Workbox', license: 'MIT' },
]
</script>
