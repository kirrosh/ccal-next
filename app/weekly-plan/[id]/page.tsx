'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WeeklyPlanView from '@/components/WeeklyPlanView';
import { WeeklyPlan, MealType, Meal } from '@/types';
import { MealPlan } from '@/schemas/meal';
import { useStorage } from '@/hooks/useStorage';
import { api } from '@/trpc/react';

const DAYS_OF_WEEK = ['День 1', 'День 2', 'День 3', 'День 4', 'День 5', 'День 6', 'День 7'];

export default function WeeklyPlanPage() {
  const router = useRouter();
  const { 
    deleteWeeklyPlan,
    addWeeklyPlan,
    updateWeeklyPlan,
    // getWeeklyPlanQuery
  } = useStorage();
  const params = useParams();
  const [error, setError] = useState('');

  const id = params.id as string;

  const { data: mealPlan, isLoading: mealPlanLoading, error: mealPlanError } = api.meal.getMealPlan.useQuery({ id: id });
  const { data: weeklyPlan, isLoading: weeklyPlanLoading } = api.weekly.getWeeklyPlanByMealPlanId.useQuery({ mealPlanId: id });

  const handleDeleteWeeklyPlan = async () => {
    if (!weeklyPlan) return;
    
    if (confirm('Вы уверены, что хотите удалить недельный план?')) {
      try {
        await deleteWeeklyPlan(weeklyPlan.id);
        router.push('/');
      } catch (err) {
        console.error('Error deleting weekly plan:', err);
        setError('Ошибка при удалении недельного плана');
      }
    }
  };

  const handleCreateWeeklyPlan = async () => {
    if (!mealPlan) return;

    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();

      // Convert days object to array format
      const daysArray = DAYS_OF_WEEK.map((day: string) => ({
        breakfast: mealPlan.menu.breakfast[0] || null,
        lunch: mealPlan.menu.lunch[0] || null,
        dinner: mealPlan.menu.dinner[0] || null,
        snacks: mealPlan.menu.snacks[0] || null
      }));

      const newWeeklyPlan: WeeklyPlan = {
        id: crypto.randomUUID(),
        userId: mealPlan.userId,
        mealPlanId: mealPlan.id || "",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: daysArray,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        v: 0
      };

      await addWeeklyPlan(newWeeklyPlan);
    } catch (err) {
      console.error('Error creating weekly plan:', err);
      setError('Ошибка при создании недельного плана');
    }
  };

  const handleUpdateWeeklyPlan = async (updatedPlan: WeeklyPlan) => {
    try {
      await updateWeeklyPlan(updatedPlan.id, updatedPlan);
    } catch (err) {
      console.error('Error updating weekly plan:', err);
      setError('Ошибка при обновлении недельного плана');
    }
  };

  if (mealPlanLoading || weeklyPlanLoading) {
    return <div>Загрузка...</div>;
  }

  if (error || mealPlanError) {
    return <div className="text-red-500">{error || 'Ошибка при загрузке данных'}</div>;
  }

  if (!mealPlan) {
    return <div>Рацион не найден</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Недельный план питания</h1>
        <div className="space-x-4">
          {weeklyPlan ? (
            <button
              onClick={handleDeleteWeeklyPlan}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Удалить план
            </button>
          ) : (
            <button
              onClick={handleCreateWeeklyPlan}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Создать недельный план
            </button>
          )}
        </div>
      </div>

      {weeklyPlan ? (
        <WeeklyPlanView
          weeklyPlan={weeklyPlan as any}
          mealPlan={mealPlan as MealPlan}
          onSave={handleUpdateWeeklyPlan}
        />
      ) : (
        <div className="text-center py-8">
          <p>Недельный план еще не создан</p>
          <p className="text-gray-600">
            Создайте недельный план, чтобы начать планирование питания
          </p>
        </div>
      )}
    </div>
  );
} 