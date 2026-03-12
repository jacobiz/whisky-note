import { ref, onUnmounted } from 'vue'
import { db } from '@/db'

/** IndexedDB からボトル画像を取得し ObjectURL を管理するコンポーザブル */
export function useBottleImage() {
  const imageUrl = ref<string | null>(null)
  let objectUrl: string | null = null

  async function loadImage(imageId: string): Promise<void> {
    const img = await db.bottleImages.get(imageId)
    if (img) {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      objectUrl = URL.createObjectURL(img.blob)
      imageUrl.value = objectUrl
    }
  }

  onUnmounted(() => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  })

  return { imageUrl, loadImage }
}
