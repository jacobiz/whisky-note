import { type Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'

/** 未保存変更がある場合に離脱確認を表示するコンポーザブル */
export function useUnsavedChangesGuard(isDirty: Ref<boolean>): void {
  const { t } = useI18n()

  onBeforeRouteLeave(() => {
    if (isDirty.value) {
      return window.confirm(t('common.discardChanges'))
    }
  })
}
