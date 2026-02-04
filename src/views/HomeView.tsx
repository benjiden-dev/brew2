import { useState, useEffect, type RefObject } from "react"
import { cn } from "@/lib/utils"
import { useRecipeStore, type Recipe } from "@/stores/recipeStore"
import { useUiStore } from "@/stores/uiStore"
import type { IosInstallPromptHandle } from "@/components/IosInstallPrompt"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
const IconFahrenheit = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M11 20V5h9v3h-6v3h5v3h-5v6zM6 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1" />
    </svg>
)

const IconCelsius = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M16.5 5c1.55 0 3 .47 4.19 1.28l-1.16 2.89A4.47 4.47 0 0 0 16.5 8C14 8 12 10 12 12.5s2 4.5 4.5 4.5c1.03 0 1.97-.34 2.73-.92l1.14 2.85A7.47 7.47 0 0 1 16.5 20A7.5 7.5 0 0 1 9 12.5A7.5 7.5 0 0 1 16.5 5M6 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1" />
    </svg>
)
import { Button } from "@/components/ui/button"
import { Plus, Coffee, Info, Trash2, Edit, Github, Download } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription } from "@/components/ui/drawer"
import { ModeToggle } from "@/components/mode-toggle"
import { Linkify } from "@/components/Linkify"
import { useIosInstallPrompt } from "@/hooks/useIosInstallPrompt"

export function HomeView({ installPromptRef }: { installPromptRef?: RefObject<IosInstallPromptHandle | null> }) {
    const { recipes, setActiveRecipe, deleteRecipe, getActiveRecipe } = useRecipeStore()
    const { setView, tempUnit, toggleTempUnit } = useUiStore()
    const { isStandalone } = useIosInstallPrompt()

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [carouselApi, setCarouselApi] = useState<any>(null)

    // Scroll to active recipe when returning from brew
    useEffect(() => {
        if (carouselApi && recipes.length > 0) {
            const activeRecipe = getActiveRecipe()
            if (activeRecipe) {
                const index = recipes.findIndex(r => r.id === activeRecipe.id)
                if (index !== -1) {
                    carouselApi.scrollTo(index)
                }
            }
        }
    }, [carouselApi, recipes, getActiveRecipe])

    const handleCardClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe)
        setIsDetailsOpen(true)
    }

    const handleStartBrew = () => {
        if (selectedRecipe) {
            setActiveRecipe(selectedRecipe.id)
            setView('brew')
            setIsDetailsOpen(false)
        }
    }

    const handleEdit = () => {
        if (selectedRecipe) {
            setActiveRecipe(selectedRecipe.id) // Set active for editing context
            setView('edit')
            setIsDetailsOpen(false)
        }
    }

    const [deleteConfirm, setDeleteConfirm] = useState(false)

    // Reset delete confirmation when drawer closes or recipe changes
    useEffect(() => {
        if (!isDetailsOpen) setDeleteConfirm(false)
    }, [isDetailsOpen, selectedRecipe])

    const handleDelete = () => {
        if (selectedRecipe) {
            if (!deleteConfirm) {
                setDeleteConfirm(true)
                // Reset after 3 seconds
                setTimeout(() => setDeleteConfirm(false), 3000)
            } else {
                deleteRecipe(selectedRecipe.id)
                setIsDetailsOpen(false)
                setDeleteConfirm(false)
            }
        }
    }

    const handleCreate = () => {
        setActiveRecipe(null) // Ensure clean state for new recipe
        setView('edit')
    }

    return (
        <div className="flex h-full flex-col p-4 max-w-md mx-auto relative">
            <header className="flex items-center justify-between py-3">
                <h1 className="text-3xl font-bold tracking-tight">brew2</h1>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <Button variant="ghost" size="icon" onClick={toggleTempUnit} className="border-2 border-border/75 rounded-lg">
                        {tempUnit === 'C' ? (
                            <IconCelsius className="h-[1.2rem] w-[1.2rem]" />
                        ) : (
                            <IconFahrenheit className="h-[1.2rem] w-[1.2rem]" />
                        )}
                        <span className="sr-only">Toggle unit</span>
                    </Button>
                    {!isStandalone && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => installPromptRef?.current?.open()}
                            className="border-2 border-border/75 rounded-lg"
                            title="Install App"
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                    )}
                    <InfoDrawer />
                    <Button variant="ghost" size="icon" onClick={handleCreate} className="border-2 border-border/75 rounded-lg">
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-start pt-2 overflow-hidden">
                {recipes.length === 0 ? (
                    <div className="text-center text-muted-foreground self-center my-auto">
                        No recipes found. Create one!
                    </div>
                ) : (
                    <div className="border rounded-xl p-4 md:p-8 bg-secondary/10 relative">
                        <Carousel
                            setApi={setCarouselApi}
                            opts={{
                                align: "center",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2 md:-ml-4">
                                {recipes.map((recipe) => (
                                    <CarouselItem key={recipe.id} className="pl-2 md:pl-4 basis-[85%]">
                                        <div className="p-1 h-full">
                                            <RecipeCard
                                                recipe={recipe}
                                                onClick={() => handleCardClick(recipe)}
                                                onStart={() => {
                                                    setActiveRecipe(recipe.id)
                                                    setView('brew')
                                                }}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="hidden sm:block">
                                <CarouselPrevious className="-left-4 bg-background/80 hover:bg-background border-primary/20" />
                                <CarouselNext className="-right-4 bg-background/80 hover:bg-background border-primary/20" />
                            </div>
                        </Carousel>
                    </div>
                )}
            </main>



            {/* Details Drawer */}
            <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader className="pb-2">
                            <DrawerTitle className="text-2xl text-left">{selectedRecipe?.title}</DrawerTitle>
                            <div className="text-muted-foreground text-sm text-left">
                                <Linkify>{selectedRecipe?.notes || ""}</Linkify>
                            </div>
                        </DrawerHeader>
                        <div className="p-4 pt-2 space-y-4">
                            {/* Ingredients Summary */}
                            {selectedRecipe && (
                                <>
                                    <RecipeStats recipe={selectedRecipe} />
                                    <RecipeMetaBadges recipe={selectedRecipe} />

                                    {/* Brewing Steps Preview */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brewing Steps</h4>
                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {selectedRecipe.steps.map((step, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs bg-secondary/30 rounded px-3 py-2">
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-mono">{index + 1}.</span>
                                                        <span className="font-medium capitalize">
                                                            {step.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                        </span>
                                                        {step.amount !== undefined && <span className="text-muted-foreground">· {step.amount}g</span>}
                                                    </span>
                                                    <span className="text-muted-foreground font-mono">
                                                        {step.time !== undefined ? `${Math.floor(step.time / 60)}:${(step.time % 60).toString().padStart(2, '0')}` : 'Pause'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button onClick={handleStartBrew} variant="secondary" className="col-span-2 h-12 text-lg" size="lg">
                                    <Coffee className="mr-2 h-5 w-5" /> Start Brew
                                </Button>
                                <Button variant="outline" onClick={handleEdit}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                <div className="relative h-10">
                                    {/* Initial Delete Button */}
                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        className={cn(
                                            "absolute inset-0 w-full transition-all duration-300 ease-in-out",
                                            deleteConfirm ? "opacity-0 translate-x-[-100%] pointer-events-none" : "opacity-100 translate-x-0"
                                        )}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                    {/* Confirm Delete Button */}
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className={cn(
                                            "absolute inset-0 w-full transition-all duration-300 ease-in-out",
                                            deleteConfirm ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
                                        )}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </DrawerContent>
            </Drawer>

        </div>
    )
}

function RecipeStats({ recipe }: { recipe: Recipe }) {
    const { tempUnit } = useUiStore()
    const totalWater = recipe.ingredients.water

    const displayTemp = (() => {
        const recipeTemp = recipe.ingredients.temp
        const recipeUnit = (recipe.ingredients as any).tempUnit || 'C'

        if (tempUnit === recipeUnit) return recipeTemp
        if (tempUnit === 'F') return Math.round((recipeTemp * 9 / 5) + 32)
        return Math.round((recipeTemp - 32) * 5 / 9)
    })()

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/40 bg-secondary/10">
                <span className="text-lg font-bold">{recipe.ingredients.coffee}g</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coffee</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/40 bg-secondary/10">
                <span className="text-lg font-bold">{totalWater}ml</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Water</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/40 bg-secondary/10">
                <div className="flex items-center gap-1">
                    <span className="text-lg font-bold">{displayTemp}°</span>
                    <span className="text-xs text-muted-foreground">{tempUnit}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Temp</span>
            </div>
        </div>
    )
}

function RecipeMetaBadges({ recipe }: { recipe: Recipe }) {
    const ratio = Math.round(recipe.ingredients.water / recipe.ingredients.coffee)
    
    // Shorten long method names for display
    const displayMethod = (method: string) => {
        if (method === "Inverted Aeropress") return "Inv. Aeropress"
        return method
    }
    
    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            {recipe.method && (
                <span className="border px-2 py-0.5 rounded-full bg-background font-medium text-foreground">{displayMethod(recipe.method)}</span>
            )}
            <span className="border px-2 py-0.5 rounded-full bg-background">1:{ratio}</span>
            <span className="border px-2 py-0.5 rounded-full bg-background">Grind {recipe.ingredients.grind}</span>
        </div>
    )
}

function RecipeCard({ recipe, onClick, onStart }: { recipe: Recipe; onClick: () => void; onStart: () => void }) {
    return (
        <div onClick={onClick} className="cursor-pointer h-full transition-transform active:scale-[0.98]">
            <Card className="h-full flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50 hover:bg-card/80 transition-colors">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-2xl leading-tight line-clamp-2 min-h-[2.5em]">{recipe.title}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5em]">
                        {recipe.notes || "No notes"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-4 pt-6">
                    <RecipeStats recipe={recipe} />
                    <RecipeMetaBadges recipe={recipe} />
                </CardContent>
                <CardFooter className="pb-6 pt-0 flex-shrink-0">
                    <Button
                        variant="secondary"
                        className="w-full font-bold"
                        size="lg"
                        onClick={(e) => {
                            e.stopPropagation()
                            onStart()
                        }}
                    >
                        <Coffee className="mr-2 h-4 w-4" />
                        Brew
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
function InfoDrawer() {
    
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="border-2 border-border/75 rounded-lg">
                    <Info className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <DrawerTitle>About brew2</DrawerTitle>
                            <span className="text-xs text-muted-foreground font-mono">0.0.1(16)</span>
                        </div>
                        <DrawerDescription>
                            A modern, open-source coffee timer. Designed for precision brewing with a mobile-first experience. Data stored locally on your device.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4 space-y-4">
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attribution</h4>
                                <p className="text-xs text-muted-foreground">
                                    Inspired by <a href="https://github.com/2brew/2brew.github.io" className="underline" target="_blank" rel="noreferrer">2brew</a>.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Sound by <a href="#" className="underline">Tunetank</a>.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href="https://github.com/benjiden-dev/brew2" target="_blank" rel="noopener noreferrer" title="View Source">
                                    <Button variant="outline" size="icon" className="h-9 w-9">
                                        <Github className="h-5 w-5" />
                                    </Button>
                                </a>
                                <a href="https://buymeacoffee.com/fx5s2fycm9w" target="_blank" rel="noopener noreferrer" title="Buy me a coffee">
                                    <Button variant="outline" size="icon" className="h-9 w-9 text-blue-900 border-blue-900 hover:bg-blue-50 dark:text-amber-600 dark:border-amber-600 dark:hover:bg-amber-950/30">
                                        <Coffee className="h-5 w-5" />
                                    </Button>
                                </a>
                            </div>
                        </div>


                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
