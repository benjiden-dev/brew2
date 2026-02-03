import { useState } from "react"
import { useRecipeStore, type Recipe, type BrewingStep } from "@/stores/recipeStore"
import { useUiStore } from "@/stores/uiStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Save, X } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"

const COMMON_METHODS = ["V60", "Aeropress", "French Press", "Kalita Wave", "Chemex", "Switch", "Moka Pot", "Espresso"]

export function EditRecipeView() {
    // ... existing hooks
    const { addRecipe, updateRecipe, getActiveRecipe } = useRecipeStore() // Need updateRecipe exposed or we can modify store
    const { setView } = useUiStore()

    // Check if we are editing
    const activeRecipe = getActiveRecipe()
    const isEditing = !!activeRecipe

    // Initial state based on editing or new
    const [title, setTitle] = useState(activeRecipe?.title || "")
    const [method, setMethod] = useState(activeRecipe?.method || "V60")
    const [isCustomMethod, setIsCustomMethod] = useState(!COMMON_METHODS.includes(activeRecipe?.method || "V60"))
    const [notes, setNotes] = useState(activeRecipe?.notes || "")
    const [coffee, setCoffee] = useState(activeRecipe?.ingredients.coffee || 20)
    const [water, setWater] = useState(activeRecipe?.ingredients.water || 300)
    const [grind, setGrind] = useState(activeRecipe?.ingredients.grind || 5)
    const [temp, setTemp] = useState(activeRecipe?.ingredients.temp || 95)
    const [tempUnit, setTempUnit] = useState<'C' | 'F'>(activeRecipe?.ingredients.tempUnit || 'C')
    const [steps, setSteps] = useState<BrewingStep[]>(activeRecipe?.steps || [])
    const [error, setError] = useState<string | null>(null)

    const handleSave = () => {
        if (!title) {
            setError("Please enter a title")
            setTimeout(() => setError(null), 3000)
            return
        }
        if (steps.length === 0) {
            setError("Please add at least one step")
            setTimeout(() => setError(null), 3000)
            return
        }

        const totalTime = steps.reduce((acc, s) => acc + s.time, 0)

        const recipeData: Recipe = {
            id: isEditing ? activeRecipe.id : crypto.randomUUID(),
            name: title.toLowerCase().replace(/\s+/g, '-'),
            title,
            method,
            notes,
            ingredients: { coffee, water, grind, temp, time: totalTime, tempUnit } as any,
            steps
        }

        if (isEditing) {
            updateRecipe(recipeData)
        } else {
            addRecipe(recipeData)
        }
        setView('home')
    }

    const addStep = () => {
        setSteps([...steps, { type: 'pour', time: 30, amount: 0 }])
    }

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index))
    }

    const updateStep = (index: number, field: keyof BrewingStep, value: any) => {
        const newSteps = [...steps]
        newSteps[index] = { ...newSteps[index], [field]: value }
        setSteps(newSteps)
    }

    return (
        <div className="flex flex-col h-full bg-background relative">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setView('home')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h2 className="font-semibold">{isEditing ? 'Edit Recipe' : 'Create Recipe'}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button variant="ghost" size="icon" onClick={handleSave}>
                        <Save className="h-6 w-6 text-primary" />
                    </Button>
                </div>
            </header>
            
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm font-medium px-4 py-2 text-center animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Recipe Title</Label>
                            <Input
                                placeholder="My Awesome V60"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Method</Label>
                            {isCustomMethod ? (
                                <div className="flex gap-2">
                                    <Input
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        placeholder="Custom Method (e.g. Siphon)"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setIsCustomMethod(false)
                                        setMethod(COMMON_METHODS[0])
                                    }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={method}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomMethod(true)
                                            setMethod("")
                                        } else {
                                            setMethod(e.target.value)
                                        }
                                    }}
                                >
                                    {COMMON_METHODS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                    <option value="custom">Custom...</option>
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Details / Notes (Links supported)</Label>
                            <Textarea
                                placeholder="E.g. Check http://example.com for video..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Coffee (g)</Label>
                                <Input
                                    type="number"
                                    value={coffee}
                                    onChange={(e) => setCoffee(Number(e.target.value))}
                                />
                                <Slider
                                    value={[coffee]}
                                    min={5}
                                    max={60}
                                    step={1}
                                    onValueChange={(v) => setCoffee(v[0])}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Water (g)</Label>
                                <Input
                                    type="number"
                                    value={water}
                                    onChange={(e) => setWater(Number(e.target.value))}
                                />
                                <Slider
                                    value={[water]}
                                    min={50}
                                    max={1000}
                                    step={10}
                                    onValueChange={(v) => setWater(v[0])}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Grind Size (1-41)</Label>
                                <Input
                                    type="number"
                                    value={grind}
                                    onChange={(e) => setGrind(Number(e.target.value))}
                                />
                                <Slider
                                    value={[grind]}
                                    min={1}
                                    max={41}
                                    step={1}
                                    onValueChange={(v) => setGrind(v[0])}
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Temp</Label>
                                    <div className="flex items-center border rounded-md overflow-hidden">
                                        <button
                                            className={`px-2 py-0.5 text-xs ${tempUnit === 'C' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                                            onClick={() => {
                                                if (tempUnit === 'F') {
                                                    setTempUnit('C')
                                                    setTemp(Math.round((temp - 32) * 5 / 9))
                                                }
                                            }}
                                        >°C</button>
                                        <button
                                            className={`px-2 py-0.5 text-xs ${tempUnit === 'F' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                                            onClick={() => {
                                                if (tempUnit === 'C') {
                                                    setTempUnit('F')
                                                    setTemp(Math.round((temp * 9 / 5) + 32))
                                                }
                                            }}
                                        >°F</button>
                                    </div>
                                </div>
                                <Input
                                    type="number"
                                    value={temp}
                                    onChange={(e) => setTemp(Number(e.target.value))}
                                />
                                <Slider
                                    value={[temp]}
                                    min={tempUnit === 'C' ? 75 : 165}
                                    max={tempUnit === 'C' ? 100 : 212}
                                    step={1}
                                    onValueChange={(v) => setTemp(v[0])}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Brewing Steps</h3>
                            <Button size="sm" variant="secondary" onClick={addStep}>
                                <Plus className="h-4 w-4 mr-1" /> Add Step
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <Card key={index} className="relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground/50 hover:text-destructive transition-colors"
                                        onClick={() => removeStep(index)}
                                    >
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label>Action</Label>
                                            <select
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                value={step.type}
                                                onChange={(e) => updateStep(index, 'type', e.target.value)}
                                            >
                                                <option value="pour">Pour</option>
                                                <option value="wait">Wait</option>
                                                <option value="bloom">Bloom</option>
                                                <option value="swirl">Swirl</option>
                                                <option value="stir">Stir</option>
                                                <option value="add">Add Coffee</option>
                                                <option value="filter">Rinse Filter</option>
                                                <option value="press">Press</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time (s)</Label>
                                            <Input
                                                type="number"
                                                value={step.time}
                                                onChange={(e) => updateStep(index, 'time', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Amount (g)</Label>
                                            <Input
                                                type="number"
                                                disabled={['wait', 'bloom', 'swirl', 'stir', 'filter', 'press'].includes(step.type)}
                                                value={step.amount || 0}
                                                onChange={(e) => updateStep(index, 'amount', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Step Note</Label>
                                            <Input
                                                value={step.notes || ""}
                                                onChange={(e) => updateStep(index, 'notes', e.target.value)}
                                                placeholder="Instructions for this step..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {steps.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No steps yet. Tap "Add Step" to begin.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
