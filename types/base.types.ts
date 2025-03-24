export type DishType = "homemade" | "readymade";
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type Goal = "weight_loss" | "muscle_gain" | "maintenance";

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Nutrients {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface Meal {
  name: string;
  dishType: DishType;
  ingredients: Ingredient[];
  nutrients: Nutrients;
  servingSize: number;
} 