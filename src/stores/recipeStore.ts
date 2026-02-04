import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type StepType = 'pour' | 'wait' | 'bloom' | 'swirl' | 'stir' | 'filter' | 'add' | 'press' | 'place-plunger' | string;

export interface CustomStepType {
    name: string;
    needsAmount: boolean;
    needsTime: boolean;
}

export interface BrewingStep {
    type: StepType;
    time?: number; // in seconds - if undefined, it's a pause step
    amount?: number; // amount of water to pour
    notes?: string;
}

export interface Ingredients {
    coffee: number; // grams
    water: number; // grams
    grind: number; // arbitrary scale
    temp: number; // celsius
    tempUnit?: 'C' | 'F';
    time: number; // total time preview
}

export interface Recipe {
    id: string; // generated UUID
    name: string; // internal slug
    title: string;
    method?: string;
    notes?: string;
    ingredients: Ingredients;
    steps: BrewingStep[];
    customStepTypes?: CustomStepType[]; // User-defined custom step types
}

interface RecipeState {
    recipes: Recipe[];
    activeRecipeId: string | null;
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    setActiveRecipe: (id: string | null) => void;
    getActiveRecipe: () => Recipe | undefined;
}

const INITIAL_RECIPES: Recipe[] = [
    {
        id: "jh-inverted-aeropress",
        name: "jh-inverted-aeropress",
        title: "James Hoffmann Inverted Aeropress",
        method: "Inverted Aeropress",
        notes: "Video: https://www.youtube.com/watch?v=AI4ynXzkSQo\\n\\nGrind size (finer than pour-over, coarser than espresso):\\n• Comandante C40: 11-16 clicks (medium roast)\\n• Baratza Encore: 12-14\\n• Timemore C2: 11 clicks (light), 12-14 (medium)\\n• 1Zpresso JX: 42-48 clicks (1.5 turns)",
        ingredients: {
            coffee: 18,
            water: 250,
            grind: 12,
            temp: 95,
            time: 180,
            tempUnit: 'C'
        },
        steps: [
            { type: "add", notes: "Assemble Aeropress inverted. Add coffee grounds. No need to rinse filter or preheat.", time: 10 },
            { type: "pour", notes: "Pour 250g hot water. Light roast: boiling water. Medium roast: 90-95°C. Dark roast: 85°C.", amount: 250, time: 15 },
            { type: "swirl", notes: "Gently swirl to saturate all grounds. No stirring needed.", time: 5 },
            { type: "wait", notes: "Steep for 2 minutes", time: 120 },
            { type: "place-plunger", notes: "Place filter cap on (dry filter is fine), flip onto cup", time: 10 },
            { type: "press", notes: "Press gently for ~30 seconds. Press all the way through the hissing sound.", time: 30 }
        ]
    },
    {
        id: "cc-chemex",
        name: "cc-chemex",
        title: "Counter Culture Chemex",
        method: "Chemex",
        notes: "Source: https://counterculturecoffee.com/pages/quick-easy-chemex\\nMakes two 12oz cups\\n\\nGrind size (medium-coarse, like kosher salt):\\n• Comandante C40: 20-24 clicks\\n• Baratza Encore: 20-24\\n• Timemore C2: 18-20 clicks",
        ingredients: {
            coffee: 45,
            water: 750,
            grind: 22,
            temp: 93,
            time: 300,
            tempUnit: 'C'
        },
        steps: [
            { type: "filter", notes: "Place filter in Chemex and rinse with hot water. Discard rinse water.", time: 15 },
            { type: "add", notes: "Add 45g ground coffee to filter. Shake to level the bed.", time: 10 },
            { type: "pour", notes: "Bloom: Pour 100g water to wet all grounds", amount: 100, time: 15 },
            { type: "wait", notes: "Wait 30 seconds for bloom", time: 30 },
            { type: "pour", notes: "Pour to 200g in circular motion", amount: 100, time: 15 },
            { type: "wait", notes: "Wait for water to drain about 1cm", time: 15 },
            { type: "pour", notes: "Pour to 300g in circular motion", amount: 100, time: 15 },
            { type: "wait", notes: "Wait for water to drain about 1cm", time: 15 },
            { type: "pour", notes: "Pour to 450g in circular motion", amount: 150, time: 20 },
            { type: "wait", notes: "Wait for water to drain about 1cm", time: 15 },
            { type: "pour", notes: "Pour to 600g in circular motion", amount: 150, time: 20 },
            { type: "wait", notes: "Wait for water to drain about 1cm", time: 15 },
            { type: "pour", notes: "Pour to 750g in circular motion", amount: 150, time: 20 },
            { type: "wait", notes: "Let coffee finish draining. Total brew time: 4:00-5:00", time: 90 }
        ]
    }
]

export const useRecipeStore = create<RecipeState>()(
    persist(
        (set, get) => ({
            recipes: INITIAL_RECIPES,
            activeRecipeId: null,
            addRecipe: (recipe) => set((state) => ({ recipes: [recipe, ...state.recipes] })),
            updateRecipe: (updatedRecipe) => set((state) => ({
                recipes: state.recipes.map((r) => r.id === updatedRecipe.id ? updatedRecipe : r)
            })),
            deleteRecipe: (id) => set((state) => ({
                recipes: state.recipes.filter((r) => r.id !== id)
            })),
            setActiveRecipe: (id) => set({ activeRecipeId: id }),
            getActiveRecipe: () => get().recipes.find((r) => r.id === get().activeRecipeId),
        }),
        {
            name: 'brew-recipe-storage-v2',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
