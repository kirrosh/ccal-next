'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserProfile, activityMultipliers } from '@/types';
import { useStorage } from '@/hooks/useStorage';
import { api } from '@/trpc/react';

// Activity level labels in Russian
const activityLabels = {
  sedentary: 'Малоподвижный образ жизни',
  light: 'Легкие упражнения 1-3 раза в неделю',
  moderate: 'Умеренные упражнения 3-5 раз в неделю',
  active: 'Интенсивные упражнения 6-7 раз в неделю',
  very_active: 'Очень интенсивные упражнения или физическая работа',
};

// Default profile values
const defaultProfile: UserProfile = {
  id: '',
  gender: 'male',
  age: 30,
  height: 170,
  weight: 70,
  activityLevel: 'moderate',
};

export default function ProfilePage() {
  const { getUserProfile } = useStorage();
  const userProfile = getUserProfile();
  const [profile, setProfile] = useState<UserProfile>(userProfile || defaultProfile);
  const [calories, setCalories] = useState<number | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Load profile from storage on component mount
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      setHasProfile(true);
      // Calculate calories with the loaded profile
      calculateCalories(userProfile);
    }
  }, [userProfile]);

  // Calculate calories using the Mifflin-St. Jeor formula
  const calculateCalories = (profileData: UserProfile) => {
    let bmr;
    if (profileData.gender === 'male') {
      bmr = 10 * profileData.weight + 6.25 * profileData.height - 5 * profileData.age + 5;
    } else {
      bmr = 10 * profileData.weight + 6.25 * profileData.height - 5 * profileData.age - 161;
    }
    
    // Apply activity multiplier
    const tdee = bmr * activityMultipliers[profileData.activityLevel];
    setCalories(Math.round(tdee));
    return Math.round(tdee);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'age' || name === 'height' || name === 'weight') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setProfile(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      setHasProfile(true);
      calculateCalories(profile);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save profile using tRPC mutation
    // updateProfileMutation.mutate(profile);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Мой профиль</h1>
          
          {hasProfile && calories && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-medium text-green-800">Ваша суточная потребность в калориях:</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{calories} ккал</p>
              <p className="text-sm text-green-700 mt-1">
                Рассчитано по формуле Миффлина-Сан Жеора на основе ваших данных
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Пол
              </label>
              <select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Возраст (лет)
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="1"
                max="120"
                value={profile.age}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Рост (см)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                min="50"
                max="250"
                value={profile.height}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Вес (кг)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                min="20"
                max="300"
                step="0.1"
                value={profile.weight}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">
                Уровень активности
              </label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {Object.entries(activityLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить профиль'}
              </button>
            </div>
          </form>
        </div>
      </main>
      
   
    </div>
  );
} 