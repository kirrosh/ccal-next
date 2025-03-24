import { useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan } from '@/types';
import { MealPlan } from '@/schemas/meal';
import { api } from '@/trpc/react';

export function useStorage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);

  const getUserProfile = () => {
    return userProfile;
  };

  const setUserProfileData = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const getWeeklyPlans = () => {
    return weeklyPlans;
  };

  const getWeeklyPlanByMealPlanId = (mealPlanId: string) => {
    return weeklyPlans.find(plan => plan.mealPlanId === mealPlanId);
  };

  const getWeeklyPlansQuery = api.weekly.getWeeklyPlans.useQuery(
    { userId: userProfile?.id || '' },
    { enabled: !!userProfile?.id }
  );

  const getWeeklyPlanQuery = api.weekly.getWeeklyPlan.useQuery;

  const addWeeklyPlanMutation = api.weekly.createWeeklyPlan.useMutation();
  const updateWeeklyPlanMutation = api.weekly.updateWeeklyPlan.useMutation();
  const saveMealPlanMutation = api.meal.saveMealPlan.useMutation();

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    // Load weekly plans from query
    if (getWeeklyPlansQuery.data) {
      setWeeklyPlans(getWeeklyPlansQuery.data);
    }
  }, [getWeeklyPlansQuery.data]);

  const addWeeklyPlan = async (plan: WeeklyPlan) => {
    try {
      const newPlan = await addWeeklyPlanMutation.mutateAsync(plan);
      setWeeklyPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (error) {
      console.error('Error creating weekly plan:', error);
      throw error;
    }
  };

  const updateWeeklyPlan = async (planId: string, updatedPlan: WeeklyPlan) => {
    try {
      const updated = await updateWeeklyPlanMutation.mutateAsync({
        id: planId,
        plan: updatedPlan
      });
      
      setWeeklyPlans(prev => prev.map(plan => 
        plan.id === planId ? updated : plan
      ));
      return updated;
    } catch (error) {
      console.error('Error updating weekly plan:', error);
      throw error;
    }
  };

  const deleteWeeklyPlan = async (planId: string) => {
    const newPlans = weeklyPlans.filter(plan => plan.id !== planId);
    setWeeklyPlans(newPlans);
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

  return {
    getUserProfile,
    setUserProfile: setUserProfileData,
    getWeeklyPlans,
    getWeeklyPlanByMealPlanId,
    addWeeklyPlan,
    updateWeeklyPlan,
    deleteWeeklyPlan,
    addMealPlan,
    getWeeklyPlanQuery
  };
} 