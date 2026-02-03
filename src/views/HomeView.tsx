import { useState, useEffect } from "react"
import { useRecipeStore, type Recipe } from "@/stores/recipeStore"
import { useUiStore } from "@/stores/uiStore"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Coffee, Info, Trash2, Edit, Github } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { ModeToggle } from "@/components/mode-toggle"
import { Linkify } from "@/components/Linkify"

export function HomeView() {
    const { recipes, setActiveRecipe, deleteRecipe } = useRecipeStore()
    const { setView, tempUnit, toggleTempUnit } = useUiStore()

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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
            <header className="flex items-center justify-between py-6">
                <h1 className="text-3xl font-bold tracking-tight">brew2</h1>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button variant="ghost" size="icon" onClick={toggleTempUnit} className="w-10">
                        <span className="font-light lowercase text-lg">{tempUnit}°</span>
                    </Button>
                    <InfoDrawer />
                    <Button variant="ghost" size="icon" onClick={handleCreate} className="border-2 border-border/75 rounded-lg">
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-end pb-8">
                {recipes.length === 0 ? (
                    <div className="text-center text-muted-foreground self-center my-auto">
                        No recipes found. Create one!
                    </div>
                ) : (
                    <div className="border rounded-xl p-4 md:p-8 bg-secondary/10 relative">
                        <Carousel
                            opts={{
                                align: "start",
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
                                <CarouselPrevious />
                                <CarouselNext />
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
                            <div className="flex justify-between items-start gap-2">
                                <DrawerTitle className="text-2xl text-left">{selectedRecipe?.title}</DrawerTitle>
                                {selectedRecipe?.method && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap mt-1">
                                        {selectedRecipe.method}
                                    </span>
                                )}
                            </div>
                            <div className="text-muted-foreground text-sm text-left">
                                <Linkify>{selectedRecipe?.notes || ""}</Linkify>
                            </div>
                        </DrawerHeader>
                        <div className="p-4 pt-2 space-y-4">
                            {/* Ingredients Summary */}
                            {selectedRecipe && (
                                <RecipeStats recipe={selectedRecipe} />
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button onClick={handleStartBrew} className="col-span-2 h-12 text-lg" size="lg">
                                    <Coffee className="mr-2 h-5 w-5" /> Start Brew
                                </Button>
                                <Button variant="outline" onClick={handleEdit}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                <Button
                                    variant={deleteConfirm ? "destructive" : "outline"}
                                    onClick={handleDelete}
                                    className={deleteConfirm ? "animate-pulse" : ""}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {deleteConfirm ? "Confirm Delete?" : "Delete"}
                                </Button>
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

function RecipeCard({ recipe, onClick, onStart }: { recipe: Recipe; onClick: () => void; onStart: () => void }) {
    const ratio = Math.round(recipe.ingredients.water / recipe.ingredients.coffee)

    return (
        <div onClick={onClick} className="cursor-pointer h-full transition-transform active:scale-[0.98]">
            <Card className="h-full border-none shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50 hover:bg-card/80 transition-colors">
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-2xl leading-tight">{recipe.title}</CardTitle>
                        {recipe.method && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                                {recipe.method}
                            </span>
                        )}
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[2.5em]">
                        {recipe.notes || "No notes"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <RecipeStats recipe={recipe} />

                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                        <span className="border px-2 py-0.5 rounded-full bg-background">1:{ratio}</span>
                        <span className="border px-2 py-0.5 rounded-full bg-background">Grind {recipe.ingredients.grind}</span>
                    </div>

                </CardContent>
                <CardFooter className="pb-6 pt-0">
                    <Button
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
                <Button variant="ghost" size="icon">
                    <Info className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>About brew2</DrawerTitle>
                        <DrawerDescription>A modern, open-source coffee timer.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Designed for precision brewing with a mobile-first experience.
                                Data stored locally on your device.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <a href="https://github.com/benjiden-dev/brew2" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Github className="h-5 w-5" />
                                    View Source
                                </Button>
                            </a>
                        </div>

                        <div className="space-y-1 pt-4 border-t">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attribution</h4>
                            <p className="text-xs text-muted-foreground">
                                Concept inspired by <a href="https://github.com/2brew/2brew.github.io" className="underline" target="_blank" rel="noreferrer">2brew</a>.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Sound by <a href="#" className="underline">Tunetank</a>.
                            </p>
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="ghost">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
