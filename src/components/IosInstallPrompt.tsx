import { useEffect, useState } from "react"
import { Share, SquarePlus } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIosInstallPrompt } from "@/hooks/useIosInstallPrompt"

export function IosInstallPrompt() {
  const [open, setOpen] = useState(false)
  const { shouldShow } = useIosInstallPrompt()

  // We need to listen to the hook's shouldShow, but also manage our own 'open' state
  // to avoid it reopening immediately if we just closed it without "dismissing" (though now we strictly dismiss or snooze)
  
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setOpen(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  const handleDismiss = () => {
    localStorage.setItem("ios-install-prompt-v2", "true")
    setOpen(false)
    // We don't force a re-render of the hook here, but next load it will be respected
  }

  const handleSnooze = () => {
    sessionStorage.setItem("ios-install-prompt-snoozed", "true")
    setOpen(false)
  }

  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg text-left">Install brew2</DrawerTitle>
            <DrawerDescription className="text-xs text-left">
              Add to your Home Screen for the best experience.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Share className="h-5 w-5 text-muted-foreground shrink-0" />
              <p>Tap <span className="font-medium text-foreground">Share</span> in the browser bar.</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <SquarePlus className="h-5 w-5 text-muted-foreground shrink-0" />
              <p>Tap <span className="font-medium text-foreground">Add to Home Screen</span>.</p>
            </div>
          </div>
          <DrawerFooter className="pt-2 flex-col gap-2">
            <Button onClick={handleDismiss} variant="outline" className="h-9 text-xs">
              Don't Remind Me Again
            </Button>
            <Button onClick={handleSnooze} variant="ghost" className="h-9 text-sm text-muted-foreground">
              Maybe later
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
