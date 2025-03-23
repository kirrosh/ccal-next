import { UserProfile, MealPlan, WeeklyPlan } from '@/types';
import { api } from '@/trpc/react';

type StorageKey = 'userProfile' | 'weeklyPlans';

interface StorageData {
  userProfile: UserProfile | null;
  weeklyPlans: WeeklyPlan[];
}

const defaultValues: StorageData = {
  userProfile: null,
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
    console.log(`Saving ${key} to localStorage:`, value);
    localStorage.setItem(key, JSON.stringify(value));
    // Verify the save
    const savedValue = localStorage.getItem(key);
    console.log(`Verified ${key} in localStorage:`, savedValue ? JSON.parse(savedValue) : null);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useStorage = () => {
  const saveMealPlanMutation = api.meal.saveMealPlan.useMutation();

  // User Profile Methods
  const getUserProfile = (): UserProfile | null => {
    return getStorageData('userProfile');
  };

  const setUserProfile = (profile: UserProfile) => {
    setStorageData('userProfile', profile);
  };

  // Meal Plan Methods
  const addMealPlan = async (plan: MealPlan) => {
    try {
      await saveMealPlanMutation.mutateAsync(plan);
      console.log('Meal plan saved to MongoDB:', plan);
    } catch (error) {
      console.error('Error saving meal plan to MongoDB:', error);
      throw error;
    }
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
    getWeeklyPlans,

    // User Profile Methods
    setUserProfile,
    
    // Meal Plan Methods
    addMealPlan,
    
    // Weekly Plan Methods
    setWeeklyPlans,
    addWeeklyPlan,
    getWeeklyPlanById,
    getWeeklyPlanByMealPlanId,
    deleteWeeklyPlan,
    updateWeeklyPlan,
  };
}; 