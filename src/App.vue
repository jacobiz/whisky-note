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
import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'
import AppToast from '@/components/AppToast.vue'

const { t } = useI18n()

// 'prompt' モードでは needRefresh ref は自動更新されないため、
// onNeedRefresh コールバックで手動制御する
const needRefresh = ref(false)
const { updateServiceWorker } = useRegisterSW({
  onNeedRefresh() {
    needRefresh.value = true
  },
})

// ダークテーマをデフォルトとして適用
document.documentElement.classList.add('dark')

// 言語設定をアプリ起動時に復元
const settingsStore = useSettingsStore()
onMounted(async () => {
  await settingsStore.initialize()
})
</script>
