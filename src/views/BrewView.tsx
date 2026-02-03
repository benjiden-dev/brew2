import { useEffect, useState, useRef } from "react"
import { useRecipeStore } from "@/stores/recipeStore"
import { useUiStore } from "@/stores/uiStore"
import { useBrewAudio, useWakeLock } from "@/hooks/useBrewCapabilities"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function BrewView() {
    const { getActiveRecipe } = useRecipeStore()
    const { setView } = useUiStore()
    const recipe = getActiveRecipe()
    const { playNotify } = useBrewAudio()
    useWakeLock()

    // State
    const [stepIndex, setStepIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [isFinished, setIsFinished] = useState(false)

    const timerRef = useRef<number | null>(null)

    if (!recipe) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <p>Error: No recipe selected</p>
                <Button onClick={() => setView('home')}>Go Home</Button>
            </div>
        )
    }

    const currentStep = recipe.steps[stepIndex]
    const nextStep = recipe.steps[stepIndex + 1]
    const totalSteps = recipe.steps.length

    // Initialize/Update step time
    useEffect(() => {
        if (!currentStep) {
            setIsFinished(true)
            return
        }
        // Only set time if we haven't started this step yet or if we just switched to it
        // Simpler: Just reset time left when stepIndex changes
        setTimeLeft(currentStep.time)
        setIsPaused(false)
    }, [stepIndex, currentStep]) // Dependency on currentStep object might be tricky if it changes ref, but from store it should be stable enough

    // Timer Logic
    useEffect(() => {
        if (!hasStarted || isPaused || isFinished) return

        if (timeLeft > 0) {
            timerRef.current = window.setTimeout(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else {
            handleStepComplete()
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [timeLeft, isPaused, hasStarted, isFinished])

    const handleStepComplete = () => {
        playNotify()
        if (stepIndex < totalSteps - 1) {
            setStepIndex((prev) => prev + 1)
        } else {
            setIsFinished(true)
        }
    }

    const togglePause = () => setIsPaused(!isPaused)

    const skipStep = () => {
        if (stepIndex < totalSteps - 1) {
            setStepIndex((prev) => prev + 1)
        } else {
            setIsFinished(true)
        }
    }

    // Progress calc: Count down
    // 0s elapsed -> progress 0% ? Or usage of ring?
    // Let's say ring fills up or empties. 
    // "Emptying" visually matches "time running out".
    const progress = currentStep ? ((currentStep.time - timeLeft) / currentStep.time) * 100 : 100

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-primary/10 p-8">
                    <CheckCircle className="w-24 h-24 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">Brew Complete!</h1>
                <p className="text-muted-foreground text-center">Enjoy your {recipe.title}.</p>
                <Button size="lg" className="w-full max-w-xs" onClick={() => setView('home')}>
                    Back to Recipes
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-4 z-10">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => setView('home')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="ml-4">
                        <h2 className="font-semibold">{recipe.title}</h2>
                        <p className="text-xs text-muted-foreground">Step {stepIndex + 1} of {totalSteps}</p>
                    </div>
                </div>
                <ModeToggle />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* Visualizer */}
                <div className="mb-8">
                    {!hasStarted ? (
                        <div
                            className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-muted flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
                            onClick={() => setHasStarted(true)}
                        >
                            <Play className="w-16 h-16 ml-2 text-primary" />
                            <span className="mt-4 font-semibold text-lg">Tap to Start</span>
                        </div>
                    ) : (
                        <CircularProgress
                            progress={progress}
                            text={formatTime(timeLeft)}
                            label={currentStep.type}
                        />
                    )}
                </div>

                {/* Step Details */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-2 max-w-md w-full"
                    >
                        <h3 className="text-3xl font-bold capitalize text-primary">{currentStep.type}</h3>
                        {currentStep.amount && (
                            <p className="text-2xl font-medium">{currentStep.amount}g</p>
                        )}
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {currentStep.notes || getDefaultInstruction(currentStep.type, currentStep.amount)}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Next Step Preview & Controls */}
            <footer className="p-6 pb-10 space-y-6">
                {nextStep && (
                    <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between border border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Up Next:</span>
                        <div className="text-sm font-semibold capitalize flex items-center gap-2">
                            {nextStep.type}
                            {nextStep.amount && ` · ${nextStep.amount}g`}
                            <span className="bg-background px-2 py-0.5 rounded text-xs text-muted-foreground border">{formatTime(nextStep.time)}</span>
                        </div>
                    </div>
                )}

                {hasStarted && (
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant={isPaused ? "default" : "secondary"}
                            size="lg"
                            className="h-16 text-lg"
                            onClick={togglePause}
                        >
                            {isPaused ? <Play className="mr-2 h-6 w-6" /> : <Pause className="mr-2 h-6 w-6" />}
                            {isPaused ? "Resume" : "Pause"}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-16 text-lg"
                            onClick={skipStep}
                        >
                            <SkipForward className="mr-2 h-6 w-6" />
                            Skip
                        </Button>
                    </div>
                )}
            </footer>
        </div>
    )
}

function CircularProgress({ progress, text, label }: { progress: number, text: string, label: string }) {
    // r=120 -> dia 240. Center 140,140 (leaves padding). ViewBox 0 0 280 280
    const r = 120
    const cx = 140
    const cy = 140
    const circumference = 2 * Math.PI * r
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-72 h-72 md:w-96 md:h-96" viewBox="0 0 280 280">
                <circle
                    className="text-muted/20"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={r}
                    cx={cx}
                    cy={cy}
                />
                <circle
                    className="text-foreground transition-all duration-1000 ease-linear"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={r}
                    cx={cx}
                    cy={cy}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-7xl md:text-8xl font-bold tracking-tighter tabular-nums">{text}</span>
                <span className="text-lg uppercase tracking-widest text-muted-foreground mt-2 font-medium">{label}</span>
            </div>
        </div>
    )
}

function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
}

function getDefaultInstruction(type: string, amount?: number) {
    switch (type) {
        case 'pour': return `Pour ${amount ? amount + 'g' : ''} of water steadily.`
        case 'bloom': return 'Let the coffee bloom. Watch for bubbles.'
        case 'wait': return 'Wait for the drawdown.'
        case 'swirl': return 'Gently swirl the brewer.'
        case 'stir': return 'Stir the grounds.'
        case 'press': return 'Press down the plunger gently.'
        default: return 'Follow the step instructions.'
    }
}
