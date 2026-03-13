import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export function useInstallPrompt() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isIos = ref(/iphone|ipad|ipod/i.test(navigator.userAgent))

  const canInstall = computed(() => deferredPrompt.value !== null)

  function handleBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
  }

  function handleAppInstalled() {
    deferredPrompt.value = null
  }

  async function promptInstall(): Promise<void> {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    deferredPrompt.value = null
  }

  // コンポーネント外（テスト環境）でも動作するよう直接登録する
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)

  // Vue コンポーネント内のときのみ onUnmounted でクリーンアップする
  if (getCurrentInstance()) {
    onUnmounted(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    })
  }

  return { canInstall, isIos, promptInstall }
}
