'use client';

import { api } from '@/trpc/react';

// Activity level labels in Russian
const activityLabels = {
  sedentary: 'Малоподвижный образ жизни',
  light: 'Легкие упражнения 1-3 раза в неделю',
  moderate: 'Умеренные упражнения 3-5 раз в неделю',
  active: 'Интенсивные упражнения 6-7 раз в неделю',
  very_active: 'Очень интенсивные упражнения или физическая работа',
};

export default function ProfilePage() {
  const { data: profile, isLoading, error } = api.profile.getProfile.useQuery();

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
          <h1 className="text-2xl font-bold mb-6">Мой профиль</h1>

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
        </div>
      </main>
    </div>
  );
}
