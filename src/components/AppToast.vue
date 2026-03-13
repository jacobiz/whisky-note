<template>
  <div
    class="fixed left-4 right-4 bg-surface-elevated border border-gold-muted rounded-xl
           px-4 py-3 flex items-center gap-3 shadow-lg z-50"
    style="bottom: calc(1rem + env(safe-area-inset-bottom))"
    role="alert"
  >
    <p class="flex-1 text-sm text-ink-primary">{{ message }}</p>
    <button
      v-if="actionLabel"
      type="button"
      class="shrink-0 text-sm font-medium text-gold hover:text-gold-light transition-colors"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
    <button
      type="button"
      aria-label="閉じる"
      class="shrink-0 text-ink-muted hover:text-ink-secondary transition-colors"
      @click="emit('close')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string
  actionLabel?: string
}>()
const emit = defineEmits<{
  action: []
  close: []
}>()
</script>
