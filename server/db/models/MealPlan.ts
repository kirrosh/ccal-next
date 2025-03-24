import mongoose from 'mongoose';

interface Nutrients {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Meal {
  name: string;
  dishType: 'homemade' | 'readymade';
  ingredients: Ingredient[];
  nutrients: Nutrients;
  servingSize: number;
}

interface DailyMenu {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

export interface IMealPlan {
  userId: string;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  preferences: string[];
  allergies: string[];
  availableProducts: string[];
  currentDate: string;
  createdAt: Date;
  menu: DailyMenu;
}

export interface MealPlanDocument extends  IMealPlan {
  _id: string;
}

const nutrientsSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fats: { type: Number, required: true },
  carbs: { type: Number, required: true },
});

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
});

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dishType: {
    type: String,
    enum: ['homemade', 'readymade'],
    required: true,
  },
  ingredients: [ingredientSchema],
  nutrients: nutrientsSchema,
  servingSize: { type: Number, required: true },
});

const dailyMenuSchema = new mongoose.Schema({
  breakfast: [mealSchema],
  lunch: [mealSchema],
  dinner: [mealSchema],
  snacks: [mealSchema],
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance'],
    required: true,
  },
  preferences: [String],
  allergies: [String],
  availableProducts: [String],
  currentDate: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  menu: {
    type: dailyMenuSchema,
    required: true,
  },
});

export const MealPlan = mongoose.models.MealPlan || mongoose.model<MealPlanDocument>('MealPlan', mealPlanSchema); 