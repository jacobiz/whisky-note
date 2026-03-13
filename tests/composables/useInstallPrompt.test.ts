import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useInstallPrompt', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初期状態: canInstall は false', async () => {
    const { useInstallPrompt } = await import('@/composables/useInstallPrompt')
    const { canInstall } = useInstallPrompt()
    expect(canInstall.value).toBe(false)
  })

  it('beforeinstallprompt 発火で canInstall が true になる', async () => {
    const { useInstallPrompt } = await import('@/composables/useInstallPrompt')
    const { canInstall } = useInstallPrompt()

    const mockEvent = { preventDefault: vi.fn() } as unknown as Event
    const handler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === 'beforeinstallprompt'
    )?.[1] as EventListener | undefined

    if (handler) handler(mockEvent)
    expect(canInstall.value).toBe(true)
  })

  it('promptInstall: deferredPrompt.prompt() が呼ばれる', async () => {
    const { useInstallPrompt } = await import('@/composables/useInstallPrompt')
    const { promptInstall } = useInstallPrompt()

    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    } as unknown as Event

    const handler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === 'beforeinstallprompt'
    )?.[1] as EventListener | undefined

    if (handler) handler(mockEvent)
    await promptInstall()
    expect(mockPrompt).toHaveBeenCalled()
  })

  it('appinstalled 発火で canInstall が false になる', async () => {
    const { useInstallPrompt } = await import('@/composables/useInstallPrompt')
    const { canInstall } = useInstallPrompt()

    // まず canInstall を true にする
    const mockInstallEvent = { preventDefault: vi.fn() } as unknown as Event
    const beforeInstallHandler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === 'beforeinstallprompt'
    )?.[1] as EventListener | undefined
    if (beforeInstallHandler) beforeInstallHandler(mockInstallEvent)
    expect(canInstall.value).toBe(true)

    // appinstalled 発火
    const installedHandler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === 'appinstalled'
    )?.[1] as EventListener | undefined
    if (installedHandler) installedHandler(new Event('appinstalled'))
    expect(canInstall.value).toBe(false)
  })

  it('iOS UA で isIos が true', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      configurable: true,
    })
    const { useInstallPrompt } = await import('@/composables/useInstallPrompt')
    const { isIos } = useInstallPrompt()
    expect(isIos.value).toBe(true)
  })
})
