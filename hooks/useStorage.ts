import { useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan } from '@/types';
import { MealPlan } from '@/schemas/meal';
import { api } from '@/trpc/react';

export function useStorage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getUserProfile = () => {
    return userProfile;
  };

  const setUserProfileData = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };


  return {
    getUserProfile,
    setUserProfile: setUserProfileData,
  };
}
