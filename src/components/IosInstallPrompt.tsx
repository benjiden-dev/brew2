import { useEffect, useState } from "react"
import { Share, SquarePlus } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export function IosInstallPrompt() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if running on iOS (iPhone, iPad, iPod) or iPadOS (MacIntel with touch)
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

    // Check if user has already dismissed the prompt (using v2 key to reset for user)
    const hasDismissed = localStorage.getItem("ios-install-prompt-v2")

    if (isIOS && !isStandalone && !hasDismissed) {
      // Show prompt after a small delay
      const timer = setTimeout(() => setOpen(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("ios-install-prompt-v2", "true")
    setOpen(false)
  }

  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Install brew2</DrawerTitle>
            <DrawerDescription>
              Install this app on your iPhone for the best experience.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-muted p-2 rounded-md">
                <Share className="h-6 w-6" />
              </div>
              <p>
                1. Tap the <span className="font-semibold">Share</span> button in
                your browser bar.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-muted p-2 rounded-md">
                <SquarePlus className="h-6 w-6" />
              </div>
              <p>
                2. Scroll down and tap <span className="font-semibold">Add to Home Screen</span>.
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleDismiss} variant="default">
              Got it
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost">Maybe later</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
