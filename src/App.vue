<template>
  <div class="min-h-screen bg-surface">
    <RouterView />
    <AppToast
      v-if="needRefresh"
      :message="t('pwa.updateAvailable')"
      :action-label="t('pwa.reload')"
      @action="updateServiceWorker()"
      @close="needRefresh = false"
    />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'
import AppToast from '@/components/AppToast.vue'

const { t } = useI18n()
const { needRefresh, updateServiceWorker } = useRegisterSW()

// ダークテーマをデフォルトとして適用
document.documentElement.classList.add('dark')

// 言語設定をアプリ起動時に復元
const settingsStore = useSettingsStore()
onMounted(async () => {
  await settingsStore.initialize()
})
</script>
