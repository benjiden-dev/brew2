import { useState, useEffect } from 'react'

// More robust iOS detection that works even with strict privacy settings
function detectIOS(): boolean {
  // Check 1: User agent (can be blocked by privacy settings)
  const ua = navigator.userAgent
  const uaCheck = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  // Check 2: Safari-specific features (more reliable)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

  // Check 3: Touch support (iOS always has touch)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Check 4: Viewport units behavior (iOS-specific)
  const hasIOSViewport = 'visualViewport' in window

  // Check 5: CSS support for iOS-specific features
  const supportsIOSBackdrop = CSS?.supports?.('-webkit-backdrop-filter', 'blur(1px)')

  // Combine checks: If user agent passes, trust it
  if (uaCheck) return true

  // If user agent is blocked but we detect Safari + touch + iOS viewport, likely iOS
  if (isSafari && hasTouch && hasIOSViewport) return true

  // Check for iOS-specific webkit features
  if (hasTouch && supportsIOSBackdrop && hasIOSViewport) return true

  return false
}

export function useIosInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [hasDismissed, setHasDismissed] = useState(false)
  const [hasSnoozed, setHasSnoozed] = useState(false)

  useEffect(() => {
    const isIOSCheck = detectIOS()
    const isStandaloneCheck = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

    const dismissed = localStorage.getItem("ios-install-prompt-v2") === "true"
    const snoozed = sessionStorage.getItem("ios-install-prompt-snoozed") === "true"

    setIsIOS(isIOSCheck)
    setIsStandalone(isStandaloneCheck)
    setHasDismissed(dismissed)
    setHasSnoozed(snoozed)
  }, [])

  const reset = () => {
    localStorage.removeItem("ios-install-prompt-v2")
    sessionStorage.removeItem("ios-install-prompt-snoozed")
    setHasDismissed(false)
    setHasSnoozed(false)
  }

  return {
    isIOS,
    isStandalone,
    hasDismissed,
    hasSnoozed,
    shouldShow: isIOS && !isStandalone && !hasDismissed && !hasSnoozed,
    reset
  }
}
