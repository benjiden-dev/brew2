import { useUiStore } from "@/stores/uiStore"
import { HomeView } from "@/views/HomeView"
import { BrewView } from "@/views/BrewView"
import { EditRecipeView } from "@/views/EditRecipeView"
import { ThemeProvider } from "@/components/theme-provider"

export default function App() {
  const { currentView } = useUiStore()

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-[100dvh] bg-background md:bg-muted/30 text-foreground antialiased selection:bg-primary/20 flex justify-center">
        <div className="w-full max-w-md bg-background min-h-[100dvh] md:min-h-[750px] md:shadow-2xl relative border-x border-border/50">
          {currentView === 'home' && <HomeView />}
          {currentView === 'brew' && <BrewView />}
          {currentView === 'edit' && <EditRecipeView />}
        </div>
      </div>
    </ThemeProvider>
  )
}
