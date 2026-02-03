import { useState, useEffect } from 'react'

export function useIosInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [hasDismissed, setHasDismissed] = useState(false)
  const [hasSnoozed, setHasSnoozed] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOSCheck = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
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
