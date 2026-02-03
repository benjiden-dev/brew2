import { useUiStore } from "@/stores/uiStore"
import { HomeView } from "@/views/HomeView"
import { BrewView } from "@/views/BrewView"
import { EditRecipeView } from "@/views/EditRecipeView"
import { ThemeProvider } from "@/components/theme-provider"

export default function App() {
  const { currentView } = useUiStore()

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-[100dvh] bg-background text-foreground antialiased selection:bg-primary/20">
        {currentView === 'home' && <HomeView />}
        {currentView === 'brew' && <BrewView />}
        {currentView === 'edit' && <EditRecipeView />}
      </div>
    </ThemeProvider>
  )
}
