import { UserProfile, MealPlan, WeeklyPlan } from '@/types';

type StorageKey = 'userProfile' | 'mealPlans' | 'weeklyPlans';

interface StorageData {
  userProfile: UserProfile | null;
  mealPlans: MealPlan[];
  weeklyPlans: WeeklyPlan[];
}

const defaultValues: StorageData = {
  userProfile: null,
  mealPlans: [],
  weeklyPlans: [],
};

// Функция для получения данных из localStorage
const getStorageData = <K extends keyof StorageData>(key: K): StorageData[K] => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValues[key];
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValues[key];
  }
};

// Функция для сохранения данных в localStorage
const setStorageData = <K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useStorage = () => {
  // User Profile Methods
  const getUserProfile = (): UserProfile | null => {
    return getStorageData('userProfile');
  };

  const setUserProfile = (profile: UserProfile) => {
    setStorageData('userProfile', profile);
  };

  // Meal Plan Methods
  const getMealPlans = (): MealPlan[] => {
    return getStorageData('mealPlans');
  };

  const setMealPlans = (plans: MealPlan[]) => {
    setStorageData('mealPlans', plans);
  };

  const addMealPlan = (plan: MealPlan) => {
    const plans = getMealPlans();
    setMealPlans([...plans, plan]);
  };

  const getMealPlanById = (id: string): MealPlan | undefined => {
    const plans = getMealPlans();
    return plans.find(plan => plan.id === id);
  };

  const deleteMealPlan = (id: string) => {
    const plans = getMealPlans();
    const updatedPlans = plans.filter(plan => plan.id !== id);
    setMealPlans(updatedPlans);
    
    // Also remove associated weekly plans
    const weeklyPlans = getWeeklyPlans();
    const updatedWeeklyPlans = weeklyPlans.filter(plan => plan.mealPlanId !== id);
    setWeeklyPlans(updatedWeeklyPlans);
  };

  const updateMealPlan = (planId: string, updatedPlan: MealPlan) => {
    const plans = getMealPlans();
    const updatedPlans = plans.map(plan => 
      plan.id === planId ? updatedPlan : plan
    );
    setMealPlans(updatedPlans);
  };

  // Weekly Plan Methods
  const getWeeklyPlans = (): WeeklyPlan[] => {
    return getStorageData('weeklyPlans');
  };

  const setWeeklyPlans = (plans: WeeklyPlan[]) => {
    setStorageData('weeklyPlans', plans);
  };

  const addWeeklyPlan = (plan: WeeklyPlan) => {
    const plans = getWeeklyPlans();
    setWeeklyPlans([...plans, plan]);
  };

  const getWeeklyPlanById = (id: string): WeeklyPlan | undefined => {
    const plans = getWeeklyPlans();
    return plans.find(plan => plan.id === id);
  };

  const getWeeklyPlanByMealPlanId = (mealPlanId: string): WeeklyPlan | undefined => {
    const plans = getWeeklyPlans();
    return plans.find(plan => plan.mealPlanId === mealPlanId);
  };

  const deleteWeeklyPlan = (id: string) => {
    const plans = getWeeklyPlans();
    const updatedPlans = plans.filter(plan => plan.id !== id);
    setWeeklyPlans(updatedPlans);
  };

  const updateWeeklyPlan = (planId: string, updatedPlan: WeeklyPlan) => {
    const plans = getWeeklyPlans();
    const updatedPlans = plans.map(plan => 
      plan.id === planId ? updatedPlan : plan
    );
    setWeeklyPlans(updatedPlans);
  };

  return {
    // Data getters
    getUserProfile,
    getMealPlans,
    getWeeklyPlans,

    // User Profile Methods
    setUserProfile,
    
    // Meal Plan Methods
    setMealPlans,
    addMealPlan,
    getMealPlanById,
    deleteMealPlan,
    updateMealPlan,
    
    // Weekly Plan Methods
    setWeeklyPlans,
    addWeeklyPlan,
    getWeeklyPlanById,
    getWeeklyPlanByMealPlanId,
    deleteWeeklyPlan,
    updateWeeklyPlan,
  };
}; 