import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type StepType = 'pour' | 'wait' | 'bloom' | 'swirl' | 'stir' | 'filter' | 'add';

export interface BrewingStep {
    type: StepType;
    time: number; // in seconds
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
        id: "james-hoffmann",
        name: "james-hoffmann",
        title: "James Hoffmann V60",
        method: "V60",
        notes: "Details: https://www.youtube.com/watch?v=AI4ynXzkSQo",
        ingredients: {
            coffee: 30,
            water: 500,
            grind: 4,
            temp: 100,
            time: 210
        },
        steps: [
            { type: "filter", notes: "Rinse paper filter with water just off the boil. This removes any paper taste and preheats the brewer", time: 10 },
            { type: "add", notes: "Create well in the middle of the grounds", time: 10 },
            { type: "pour", notes: "Add 2x coffee weight = 60g of bloom water", amount: 60, time: 10 },
            { type: "swirl", notes: "Swirl the coffee slurry until evenly mixed", time: 5 },
            { type: "bloom", notes: "Continue the bloom for up to 45s. This allows CO2 to escape which will improve extraction", time: 30 },
            { type: "pour", notes: "Add water aiming for 60% of total brew weight = 300g in the next 30s", amount: 240, time: 30 },
            { type: "pour", notes: "Add water aiming for 100% of the total brew weight = 500g in the next 30s. Pour a little slower than the first phase", amount: 200, time: 30 },
            { type: "stir", notes: "Stir 1x clockwise and 1x anticlockwise with a spoon. This knocks off grounds from the side wall", time: 5 },
            { type: "wait", notes: "Allow V60 to drain a little", time: 10 },
            { type: "swirl", notes: "Give V60 a gentle swirl", time: 5 },
            { type: "wait", notes: "Let brew draw down. Aim to finish by t = 3:30", time: 85 }
        ]
    },
    {
        id: "tetsu-kasuya",
        name: "tetsu-kasuya",
        title: "Tetsu Kasuya 4:6",
        method: "V60",
        notes: "More info: https://en.philocoffea.com/blogs/blog/coffee-brewing-method",
        ingredients: {
            coffee: 20,
            water: 300,
            grind: 7,
            temp: 92,
            time: 210
        },
        steps: [
            { type: "pour", amount: 60, time: 5 },
            { type: "wait", time: 40 },
            { type: "pour", amount: 60, time: 5 },
            { type: "wait", time: 40 },
            { type: "pour", amount: 60, time: 5 },
            { type: "wait", time: 40 },
            { type: "pour", amount: 60, time: 5 },
            { type: "wait", time: 25 },
            { type: "pour", amount: 60, time: 5 },
            { type: "wait", time: 40 }
        ]
    }
]

export const useRecipeStore = create<RecipeState>()(
    persist(
        (set, get) => ({
            recipes: INITIAL_RECIPES,
            activeRecipeId: null,
            addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
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
