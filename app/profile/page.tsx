'use client';

import { toast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { useState } from 'react';

// Activity level labels in Russian
const activityLabels = {
  sedentary: 'Малоподвижный образ жизни',
  light: 'Легкие упражнения 1-3 раза в неделю',
  moderate: 'Умеренные упражнения 3-5 раз в неделю',
  active: 'Интенсивные упражнения 6-7 раз в неделю',
  very_active: 'Очень интенсивные упражнения или физическая работа',
} as const;

// Activity level multipliers for Harris-Benedict formula
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

type ActivityLevel = keyof typeof activityLabels;
type Gender = 'male' | 'female';

interface FormData {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  daily_calories: number | null;
}

export default function ProfilePage() {
  const { data: profile, isLoading, error } = api.profile.getProfile.useQuery();
  const utils = api.useUtils();
  const updateProfile = api.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.getProfile.invalidate();
      toast({
        title: 'Профиль обновлен',
      });
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    gender: 'male',
    age: 30,
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    daily_calories: 2000,
  });

  const calculateCalories = () => {
    let bmr;
    if (formData.gender === 'male') {
      bmr = 88.36 + (13.4 * formData.weight) + (4.8 * formData.height) - (5.7 * formData.age);
    } else {
      bmr = 447.6 + (9.2 * formData.weight) + (3.1 * formData.height) - (4.3 * formData.age);
    }
    return Math.round(bmr * activityMultipliers[formData.activityLevel]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const daily_calories = calculateCalories();
    await updateProfile.mutateAsync({
      ...formData,
      daily_calories,
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Ошибка загрузки профиля: {error.message}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Профиль не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Мой профиль</h1>
            {!isEditing && (
              <button
                onClick={() => {
                  setFormData({
                    gender: profile.gender as Gender,
                    age: profile.age,
                    height: profile.height,
                    weight: profile.weight,
                    activityLevel: profile.activityLevel as ActivityLevel,
                    daily_calories: profile.daily_calories,
                  });
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Редактировать
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Пол</label>
                <select
                  value={formData.gender}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value as Gender;
                    if (value === 'male' || value === 'female') {
                      setFormData({ ...formData, gender: value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Возраст</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Рост (см)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="50"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Вес (кг)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="20"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Уровень активности</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value as ActivityLevel;
                    if (Object.keys(activityLabels).includes(value)) {
                      setFormData({ ...formData, activityLevel: value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {(Object.entries(activityLabels) as [ActivityLevel, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="font-medium">Пол:</span>{' '}
                <span>{profile.gender === 'male' ? 'Мужской' : 'Женский'}</span>
              </div>
              <div>
                <span className="font-medium">Возраст:</span> <span>{profile.age} лет</span>
              </div>
              <div>
                <span className="font-medium">Рост:</span> <span>{profile.height} см</span>
              </div>
              <div>
                <span className="font-medium">Вес:</span> <span>{profile.weight} кг</span>
              </div>
              <div>
                <span className="font-medium">Уровень активности:</span>{' '}
                <span>{activityLabels[profile.activityLevel as keyof typeof activityLabels]}</span>
              </div>
              {profile.daily_calories && (
                <div>
                  <span className="font-medium">Суточная норма калорий:</span>{' '}
                  <span>{profile.daily_calories} ккал</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
