export function useCamera() {
  function openFilePicker(input: HTMLInputElement): void {
    input.click()
  }

  function getFileFromInput(input: HTMLInputElement): File | null {
    return input.files?.[0] ?? null
  }

  return { openFilePicker, getFileFromInput }
}
