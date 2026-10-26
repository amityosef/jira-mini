const isApplePlatform =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)

export const MOD_KEY_LABEL = isApplePlatform ? '⌘' : 'Ctrl'
