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

      <!-- データ管理 -->
    <section class="bg-surface-elevated border border-gold-muted rounded-xl p-4 space-y-3">
      <h2 class="text-sm font-medium text-ink-secondary uppercase tracking-wider">
        {{ t('settings.dataManagement') }}
      </h2>
      <div class="space-y-2">
        <!-- エクスポート -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-ink-primary text-sm">{{ t('settings.exportData') }}</p>
            <p class="text-ink-muted text-xs">{{ t('settings.exportDescription') }}</p>
          </div>
          <div class="ml-4 shrink-0 flex flex-col items-end gap-1">
            <button
              type="button"
              :disabled="isExporting"
              class="px-3 py-1.5 rounded-lg border border-gold-muted text-sm text-ink-primary
                     hover:bg-surface-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleExport"
            >
              {{ isExporting ? t('common.loading') : t('settings.exportData') }}
            </button>
            <p v-if="exportSuccess" class="text-xs text-green-400">{{ t('export.successMessage') }}</p>
          </div>
        </div>

        <!-- インポート -->
        <div class="flex items-center justify-between border-t border-gold-muted/30 pt-2">
          <div>
            <p class="text-ink-primary text-sm">{{ t('settings.importData') }}</p>
            <p class="text-ink-muted text-xs">{{ t('settings.importDescription') }}</p>
          </div>
          <button
            type="button"
            :disabled="isImporting"
            class="ml-4 shrink-0 px-3 py-1.5 rounded-lg border border-gold-muted text-sm text-ink-primary
                   hover:bg-surface-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="triggerFileInput"
          >
            {{ isImporting ? t('common.loading') : t('settings.importData') }}
          </button>
        </div>
        <!-- 非表示ファイル入力 -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileChange"
        />
      </div>
    </section>

    <!-- インポート確認ダイアログ -->
    <ImportConfirmDialog
      :visible="showImportConfirm"
      :total-count="importPreview?.total ?? 0"
      :skipped-count="importPreview?.skipped ?? 0"
      @confirm="handleImportConfirm"
      @cancel="showImportConfirm = false"
    />

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
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'
import ImportConfirmDialog from '@/components/ImportConfirmDialog.vue'
import { useImportExport } from '@/composables/useImportExport'
import type { ImportPreview } from '@/composables/useImportExport'

const router = useRouter()
const { t } = useI18n()
const { isExporting, isImporting, exportData, previewImport, executeImport } = useImportExport()

// エクスポート成功フィードバック
const exportSuccess = ref(false)
let exportSuccessTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (exportSuccessTimer) clearTimeout(exportSuccessTimer)
})

// インポート状態管理
const fileInputRef = ref<HTMLInputElement | null>(null)
const showImportConfirm = ref(false)
const importPreview = ref<ImportPreview | null>(null)

async function handleExport() {
  try {
    await exportData()
    exportSuccess.value = true
    if (exportSuccessTimer) clearTimeout(exportSuccessTimer)
    exportSuccessTimer = setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  } catch {
    alert(t('export.errorFailed'))
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  // ファイル入力をリセット（同じファイルを再選択できるよう）
  ;(event.target as HTMLInputElement).value = ''

  try {
    const preview = await previewImport(file)
    if (preview.notes.length === 0) {
      alert(t('import.noNotes'))
      return
    }
    importPreview.value = preview
    showImportConfirm.value = true
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('import.errorReadFailed')
    alert(msg)
  }
}

async function handleImportConfirm() {
  showImportConfirm.value = false
  try {
    const result = await executeImport(importPreview.value?.notes ?? [])
    alert(t('import.successMessage', { added: result.added, skipped: result.skipped }))
  } catch {
    alert(t('import.errorReadFailed'))
  } finally {
    importPreview.value = null
  }
}
</script>
