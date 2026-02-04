import { useState } from "react"

// UUID generator with fallback for older browsers/non-secure contexts
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    // Fallback UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
import { useRecipeStore, type Recipe, type BrewingStep, type CustomStepType } from "@/stores/recipeStore"
import { useUiStore } from "@/stores/uiStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Save, X, GripVertical, Edit } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

const COMMON_METHODS = ["V60", "Aeropress", "Inverted Aeropress", "French Press", "Kalita Wave", "Chemex", "Switch", "Moka Pot", "Espresso"]

// Define available actions per method (in logical brewing order)
const METHOD_ACTIONS: Record<string, string[]> = {
    "V60": ["filter", "add", "bloom", "pour", "stir", "swirl", "wait"],
    "Kalita Wave": ["filter", "add", "bloom", "pour", "stir", "swirl", "wait"],
    "Chemex": ["filter", "add", "bloom", "pour", "stir", "swirl", "wait"],
    "Aeropress": ["filter", "add", "bloom", "pour", "stir", "swirl", "wait", "press"],
    "Inverted Aeropress": ["add", "pour", "stir", "swirl", "wait", "place-plunger", "press"],
    "French Press": ["add", "bloom", "pour", "stir", "swirl", "wait", "press"],
    "Switch": ["filter", "add", "bloom", "pour", "stir", "swirl", "wait"],
    "Moka Pot": ["add", "wait"],
    "Espresso": ["add", "wait"],
}

const DEFAULT_ACTIONS = ["filter", "add", "bloom", "pour", "stir", "swirl", "wait", "press", "place-plunger"]

const ACTION_LABELS: Record<string, string> = {
    "filter": "Rinse Filter",
    "add": "Add Coffee",
    "bloom": "Bloom",
    "pour": "Pour",
    "stir": "Stir",
    "swirl": "Swirl",
    "wait": "Wait",
    "press": "Press",
    "place-plunger": "Place Plunger",
}

function getAvailableActions(method: string): string[] {
    // Custom methods get all default actions
    if (!COMMON_METHODS.includes(method)) {
        return DEFAULT_ACTIONS
    }
    return METHOD_ACTIONS[method] || DEFAULT_ACTIONS
}

// Default step sequences for each method
const DEFAULT_STEPS: Record<string, BrewingStep[]> = {
    "V60": [
        { type: "filter", time: 10, notes: "Rinse filter with hot water" },
        { type: "add", time: 10, notes: "Add coffee grounds, create well in center" },
        { type: "bloom", time: 45, amount: 60, notes: "Pour 2x coffee weight for bloom" },
        { type: "pour", time: 30, amount: 240, notes: "Pour to 60% total weight" },
        { type: "pour", time: 30, amount: 200, notes: "Pour to 100% total weight" },
        { type: "swirl", time: 5, notes: "Gentle swirl" },
        { type: "wait", time: 90, notes: "Wait for drawdown" },
    ],
    "Aeropress": [
        { type: "filter", time: 10, notes: "Rinse filter" },
        { type: "add", time: 10, notes: "Add coffee" },
        { type: "pour", time: 10, amount: 200, notes: "Add water" },
        { type: "stir", time: 10, notes: "Stir gently" },
        { type: "wait", time: 60, notes: "Steep" },
        { type: "press", time: 30, notes: "Press slowly" },
    ],
    "Inverted Aeropress": [
        { type: "add", time: 10, notes: "Add coffee to inverted Aeropress" },
        { type: "pour", time: 10, amount: 50, notes: "Add bloom water" },
        { type: "stir", time: 5, notes: "Stir bloom" },
        { type: "pour", time: 10, amount: 150, notes: "Add remaining water" },
        { type: "wait", time: 60, notes: "Steep" },
        { type: "place-plunger", notes: "Flip and place plunger" },
        { type: "press", time: 30, notes: "Press slowly" },
    ],
    "French Press": [
        { type: "add", time: 10, notes: "Add coarse grounds" },
        { type: "pour", time: 30, amount: 500, notes: "Add hot water" },
        { type: "stir", time: 10, notes: "Stir gently" },
        { type: "wait", time: 240, notes: "Steep for 4 minutes" },
        { type: "press", time: 20, notes: "Press plunger slowly" },
    ],
    "Chemex": [
        { type: "filter", time: 15, notes: "Rinse thick filter thoroughly" },
        { type: "add", time: 10, notes: "Add coffee grounds" },
        { type: "bloom", time: 45, amount: 80, notes: "Bloom with 2x coffee weight" },
        { type: "pour", time: 120, amount: 420, notes: "Slow circular pour" },
        { type: "wait", time: 60, notes: "Wait for drawdown" },
    ],
}

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
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [customStepTypes, setCustomStepTypes] = useState<CustomStepType[]>(activeRecipe?.customStepTypes || [])
    const [isManageStepsOpen, setIsManageStepsOpen] = useState(false)
    const [newCustomActionName, setNewCustomActionName] = useState("")
    const [newCustomActionNeedsAmount, setNewCustomActionNeedsAmount] = useState(false)
    const [newCustomActionNeedsTime, setNewCustomActionNeedsTime] = useState(true)
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null)
    const [hasDefaultSteps, setHasDefaultSteps] = useState(false)

    // Step editor dialog state
    const [isStepEditorOpen, setIsStepEditorOpen] = useState(false)
    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
    const [editStepType, setEditStepType] = useState<string>('filter')
    const [editStepTime, setEditStepTime] = useState<number | undefined>(10)
    const [editStepAmount, setEditStepAmount] = useState<number | undefined>(undefined)
    const [editStepNotes, setEditStepNotes] = useState('')
    const [editStepHasTime, setEditStepHasTime] = useState(true)
    const [editStepHasAmount, setEditStepHasAmount] = useState(false)

    const handleSave = () => {
        console.log('handleSave called', { title, steps: steps.length })
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

        const totalTime = steps.reduce((acc, s) => acc + (s.time || 0), 0)

        const recipeData: Recipe = {
            id: isEditing ? activeRecipe.id : generateUUID(),
            name: title.toLowerCase().replace(/\s+/g, '-'),
            title,
            method,
            notes,
            ingredients: { coffee, water, grind, temp, time: totalTime, tempUnit } as any,
            steps,
            customStepTypes: customStepTypes.length > 0 ? customStepTypes : undefined
        }

        if (isEditing) {
            console.log('Updating recipe:', recipeData.id)
            updateRecipe(recipeData)
        } else {
            console.log('Adding new recipe:', recipeData.id)
            addRecipe(recipeData)
        }
        console.log('Navigating to home')
        setView('home')
    }

    const addStep = () => {
        // Open dialog to add new step
        setEditingStepIndex(null)
        // Set to first available action for current method
        const firstAction = availableActions[0] || 'filter'
        setEditStepType(firstAction)
        setEditStepTime(10)
        setEditStepAmount(undefined)
        setEditStepNotes('')
        setEditStepHasTime(true)
        setEditStepHasAmount(false)
        setIsStepEditorOpen(true)
    }

    const openStepEditor = (index: number) => {
        const step = steps[index]
        setEditingStepIndex(index)
        setEditStepType(step.type)
        setEditStepTime(step.time)
        setEditStepAmount(step.amount)
        setEditStepNotes(step.notes || '')
        setEditStepHasTime(step.time !== undefined)
        setEditStepHasAmount(step.amount !== undefined)
        setIsStepEditorOpen(true)
    }

    const saveStep = () => {
        const newStep: BrewingStep = {
            type: editStepType,
            time: editStepHasTime ? editStepTime : undefined,
            amount: editStepHasAmount ? editStepAmount : undefined,
            notes: editStepNotes || undefined,
        }

        if (editingStepIndex !== null) {
            // Update existing step
            const newSteps = [...steps]
            newSteps[editingStepIndex] = newStep
            setSteps(newSteps)
        } else {
            // Add new step
            setSteps([...steps, newStep])
        }

        setIsStepEditorOpen(false)
    }

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index))
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newSteps = [...steps]
        const draggedStep = newSteps[draggedIndex]
        newSteps.splice(draggedIndex, 1)
        newSteps.splice(index, 0, draggedStep)

        setSteps(newSteps)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    const handleAddCustomAction = () => {
        if (!newCustomActionName.trim()) {
            return
        }

        const customType: CustomStepType = {
            name: newCustomActionName.trim().toLowerCase().replace(/\s+/g, '-'),
            needsAmount: newCustomActionNeedsAmount,
            needsTime: newCustomActionNeedsTime
        }

        setCustomStepTypes([...customStepTypes, customType])
        setNewCustomActionName("")
        setNewCustomActionNeedsAmount(false)
        setNewCustomActionNeedsTime(true)
    }

    const handleDeleteCustomAction = (index: number) => {
        if (deleteConfirmIndex === index) {
            const newCustomTypes = customStepTypes.filter((_, i) => i !== index)
            setCustomStepTypes(newCustomTypes)
            setDeleteConfirmIndex(null)
        } else {
            setDeleteConfirmIndex(index)
            // Reset confirmation after 3 seconds
            setTimeout(() => setDeleteConfirmIndex(null), 3000)
        }
    }

    const getStepLabel = (type: string) => {
        if (ACTION_LABELS[type]) return ACTION_LABELS[type]

        const customType = customStepTypes.find(ct => ct.name === type)
        if (customType) {
            return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }

        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    const availableActions = getAvailableActions(method)

    const handleToggleDefaultSteps = () => {
        if (hasDefaultSteps) {
            // Undo - clear all steps
            setSteps([])
            setHasDefaultSteps(false)
        } else {
            // Add default steps for this method
            const defaultSteps = DEFAULT_STEPS[method]
            if (defaultSteps) {
                setSteps([...defaultSteps])
                setHasDefaultSteps(true)
            }
        }
    }

    const canAddDefaultSteps = DEFAULT_STEPS[method] !== undefined

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
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Save button clicked')
                            handleSave()
                        }} 
                        className="border-2 border-primary/50 hover:bg-primary/10"
                    >
                        <Save className="h-5 w-5 text-primary" />
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
                                        setHasDefaultSteps(false)
                                    }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
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
                                            setHasDefaultSteps(false)
                                        }}
                                    >
                                        {COMMON_METHODS.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                        <option value="custom">Custom...</option>
                                    </select>
                                    {canAddDefaultSteps && (
                                        <Button
                                            variant={hasDefaultSteps ? "destructive" : "outline"}
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={handleToggleDefaultSteps}
                                        >
                                            {hasDefaultSteps ? "Clear Default Steps" : "Add Default Steps"}
                                        </Button>
                                    )}
                                </>
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
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setIsManageStepsOpen(true)}>
                                    Manage Steps
                                </Button>
                                <Button size="sm" variant="secondary" onClick={addStep}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Step
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <Card
                                    key={index}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group cursor-move transition-all ${
                                        draggedIndex === index ? 'opacity-50 scale-95' : ''
                                    }`}
                                >
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground/50 hover:text-destructive transition-colors z-10"
                                        onClick={() => removeStep(index)}
                                    >
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                    <CardContent
                                        className="p-4 pl-10 cursor-pointer hover:bg-secondary/30 transition-colors"
                                        onClick={() => openStepEditor(index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="font-medium text-sm capitalize">
                                                    {index + 1}. {getStepLabel(step.type)}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    {step.time !== undefined && <span>{step.time}s</span>}
                                                    {step.time === undefined && <span className="text-primary">Pause</span>}
                                                    {step.amount !== undefined && <span>· {step.amount}g</span>}
                                                </div>
                                                {step.notes && (
                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                        {step.notes}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openStepEditor(index)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
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

            {/* Step Editor Drawer */}
            <Drawer open={isStepEditorOpen} onOpenChange={setIsStepEditorOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>{editingStepIndex !== null ? 'Edit Step' : 'Add Step'}</DrawerTitle>
                            <DrawerDescription>
                                Configure the brewing step details.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 space-y-4">
                            {/* Action Type */}
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                    value={editStepType}
                                    onValueChange={(newType) => {
                                        setEditStepType(newType)

                                        // Auto-set checkboxes based on custom action properties
                                        const customType = customStepTypes.find(ct => ct.name === newType)
                                        if (customType) {
                                            setEditStepHasTime(customType.needsTime)
                                            setEditStepHasAmount(customType.needsAmount)
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableActions.includes("filter") && <SelectItem value="filter">Rinse Filter</SelectItem>}
                                        {availableActions.includes("add") && <SelectItem value="add">Add Coffee</SelectItem>}
                                        {availableActions.includes("bloom") && <SelectItem value="bloom">Bloom</SelectItem>}
                                        {availableActions.includes("pour") && <SelectItem value="pour">Pour</SelectItem>}
                                        {availableActions.includes("stir") && <SelectItem value="stir">Stir</SelectItem>}
                                        {availableActions.includes("swirl") && <SelectItem value="swirl">Swirl</SelectItem>}
                                        {availableActions.includes("wait") && <SelectItem value="wait">Wait</SelectItem>}
                                        {availableActions.includes("place-plunger") && <SelectItem value="place-plunger">Place Plunger</SelectItem>}
                                        {availableActions.includes("press") && <SelectItem value="press">Press</SelectItem>}
                                        {customStepTypes.map(ct => (
                                            <SelectItem key={ct.name} value={ct.name}>{getStepLabel(ct.name)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Has Timer / Has Amount */}
                            <div className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="editHasTime"
                                        checked={editStepHasTime}
                                        onChange={(e) => setEditStepHasTime(e.target.checked)}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label htmlFor="editHasTime" className="cursor-pointer text-sm">
                                        Has Timer
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="editHasAmount"
                                        checked={editStepHasAmount}
                                        onChange={(e) => setEditStepHasAmount(e.target.checked)}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label htmlFor="editHasAmount" className="cursor-pointer text-sm">
                                        Has Amount
                                    </Label>
                                </div>
                            </div>

                            {/* Time Field */}
                            {editStepHasTime && (
                                <div className="space-y-2">
                                    <Label>Time (seconds)</Label>
                                    <Input
                                        type="number"
                                        value={editStepTime || 0}
                                        onChange={(e) => setEditStepTime(Number(e.target.value))}
                                        placeholder="30"
                                    />
                                </div>
                            )}

                            {/* Amount Field */}
                            {editStepHasAmount && (
                                <div className="space-y-2">
                                    <Label>Amount (grams)</Label>
                                    <Input
                                        type="number"
                                        value={editStepAmount || 0}
                                        onChange={(e) => setEditStepAmount(Number(e.target.value))}
                                        placeholder="60"
                                    />
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label>Instructions</Label>
                                <Textarea
                                    value={editStepNotes}
                                    onChange={(e) => setEditStepNotes(e.target.value)}
                                    placeholder="Optional step instructions..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button onClick={saveStep}>
                                {editingStepIndex !== null ? 'Save Changes' : 'Add Step'}
                            </Button>
                            <Button variant="outline" onClick={() => setIsStepEditorOpen(false)}>
                                Cancel
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Manage Steps Drawer */}
            <Drawer open={isManageStepsOpen} onOpenChange={setIsManageStepsOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Manage Custom Steps</DrawerTitle>
                            <DrawerDescription>
                                Create custom brewing actions for your recipe.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 space-y-4">
                            {/* Existing Custom Actions */}
                            {customStepTypes.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Custom Actions</Label>
                                    <div className="space-y-2">
                                        {customStepTypes.map((ct, index) => (
                                            <div key={ct.name} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{getStepLabel(ct.name)}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ct.needsTime ? 'Timer' : 'No timer'}
                                                        {ct.needsTime && ct.needsAmount && ' · '}
                                                        {ct.needsAmount ? 'Amount' : ct.needsTime ? '' : ' · No amount'}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={deleteConfirmIndex === index ? "destructive" : "ghost"}
                                                    onClick={() => handleDeleteCustomAction(index)}
                                                    className={deleteConfirmIndex === index ? "animate-pulse" : ""}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    {deleteConfirmIndex === index ? "Confirm?" : "Delete"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Custom Action */}
                            <div className="space-y-3 pt-2 border-t">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Add New Action</Label>
                                <Input
                                    placeholder="e.g., Skim, Decant, Cool"
                                    value={newCustomActionName}
                                    onChange={(e) => setNewCustomActionName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAction()}
                                />
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="needsTime"
                                            checked={newCustomActionNeedsTime}
                                            onChange={(e) => setNewCustomActionNeedsTime(e.target.checked)}
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <Label htmlFor="needsTime" className="cursor-pointer text-sm">
                                            Include timer field
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="needsAmount"
                                            checked={newCustomActionNeedsAmount}
                                            onChange={(e) => setNewCustomActionNeedsAmount(e.target.checked)}
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <Label htmlFor="needsAmount" className="cursor-pointer text-sm">
                                            Include amount field
                                        </Label>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddCustomAction}
                                    disabled={!newCustomActionName.trim()}
                                    size="sm"
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Action
                                </Button>
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button variant="outline" onClick={() => setIsManageStepsOpen(false)}>
                                Done
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
