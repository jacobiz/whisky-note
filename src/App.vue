<template>
  <div class="min-h-screen bg-surface">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { onMounted } from 'vue'

// ダークテーマをデフォルトとして適用
document.documentElement.classList.add('dark')

// 言語設定をアプリ起動時に復元
const settingsStore = useSettingsStore()
onMounted(async () => {
  await settingsStore.initialize()
})
</script>
