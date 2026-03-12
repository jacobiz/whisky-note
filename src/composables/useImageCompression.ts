import { ref } from 'vue'
import imageCompression from 'browser-image-compression'
import { IMAGE_MAX_SIZE_MB } from '@/db/types'

export function useImageCompression() {
  const isCompressing = ref(false)
  const error = ref<string | null>(null)

  async function compress(file: File): Promise<File | null> {
    isCompressing.value = true
    error.value = null

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: IMAGE_MAX_SIZE_MB,
        useWebWorker: true,
      })
      return compressed
    } catch (e) {
      error.value = e instanceof Error ? e.message : '画像の圧縮に失敗しました'
      return null
    } finally {
      isCompressing.value = false
    }
  }

  return { compress, isCompressing, error }
}
