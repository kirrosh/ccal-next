'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WeeklyPlanView from '@/components/WeeklyPlanView';
import { WeeklyPlan, MealType, Meal } from '@/types';
import { MealPlan } from '@/schemas/meal';
import { useStorage } from '@/hooks/useStorage';
import { api } from '@/trpc/react';
import { z } from 'zod';

const DAYS_OF_WEEK = ['День 1', 'День 2', 'День 3', 'День 4', 'День 5', 'День 6', 'День 7'];

// Define the schema to match the TRPC router
const mealSchema = z.object({
  name: z.string(),
  dishType: z.enum(['homemade', 'readymade']),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
  })),
  nutrients: z.object({
    calories: z.number(),
    protein: z.number(),
    fats: z.number(),
    carbs: z.number(),
  }),
  servingSize: z.number(),
});

const weeklyPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mealPlanId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.array(z.object({
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
    snacks: mealSchema
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
  v: z.number()
});

type WeeklyPlanInput = z.infer<typeof weeklyPlanSchema>;

export default function WeeklyPlanPage() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState('');

  const id = params.id as string;

  const { data: mealPlan, isLoading: mealPlanLoading, error: mealPlanError } = api.meal.getMealPlan.useQuery({ id: id });
  const { data: weeklyPlan, isLoading: weeklyPlanLoading } = api.weekly.getWeeklyPlanByMealPlanId.useQuery({ mealPlanId: id });
  const deleteWeeklyPlanMutation = api.weekly.deleteWeeklyPlan.useMutation();
  const createWeeklyPlanMutation = api.weekly.createWeeklyPlan.useMutation();
  const updateWeeklyPlanMutation = api.weekly.updateWeeklyPlan.useMutation();

  const handleDeleteWeeklyPlan = async () => {
    if (!weeklyPlan) return;
    
    if (confirm('Вы уверены, что хотите удалить недельный план?')) {
      try {
        await deleteWeeklyPlanMutation.mutateAsync({ id: weeklyPlan.id });
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

      // Default empty meal
      const emptyMeal = {
        name: '',
        dishType: 'homemade' as const,
        ingredients: [],
        nutrients: {
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0
        },
        servingSize: 0
      };

      // Convert days object to array format and ensure meal types match schema
      const daysArray = DAYS_OF_WEEK.map((day: string) => ({
        breakfast: mealPlan.menu.breakfast[0] ? {
          ...mealPlan.menu.breakfast[0],
          dishType: mealPlan.menu.breakfast[0].dishType as 'homemade' | 'readymade'
        } : emptyMeal,
        lunch: mealPlan.menu.lunch[0] ? {
          ...mealPlan.menu.lunch[0],
          dishType: mealPlan.menu.lunch[0].dishType as 'homemade' | 'readymade'
        } : emptyMeal,
        dinner: mealPlan.menu.dinner[0] ? {
          ...mealPlan.menu.dinner[0],
          dishType: mealPlan.menu.dinner[0].dishType as 'homemade' | 'readymade'
        } : emptyMeal,
        snacks: mealPlan.menu.snacks[0] ? {
          ...mealPlan.menu.snacks[0],
          dishType: mealPlan.menu.snacks[0].dishType as 'homemade' | 'readymade'
        } : emptyMeal
      }));

      const newWeeklyPlan: WeeklyPlanInput = {
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

      await createWeeklyPlanMutation.mutateAsync(newWeeklyPlan);
    } catch (err) {
      console.error('Error creating weekly plan:', err);
      setError('Ошибка при создании недельного плана');
    }
  };

  const handleUpdateWeeklyPlan = async (updatedPlan: WeeklyPlan) => {
    try {
      // Default empty meal
      const emptyMeal = {
        name: '',
        dishType: 'homemade' as const,
        ingredients: [],
        nutrients: {
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0
        },
        servingSize: 0
      };

      // Ensure meal types match schema before updating
      const planWithCorrectTypes: WeeklyPlanInput = {
        ...updatedPlan,
        days: updatedPlan.days.map(day => ({
          breakfast: day.breakfast ? {
            ...day.breakfast,
            dishType: day.breakfast.dishType as 'homemade' | 'readymade'
          } : emptyMeal,
          lunch: day.lunch ? {
            ...day.lunch,
            dishType: day.lunch.dishType as 'homemade' | 'readymade'
          } : emptyMeal,
          dinner: day.dinner ? {
            ...day.dinner,
            dishType: day.dinner.dishType as 'homemade' | 'readymade'
          } : emptyMeal,
          snacks: day.snacks ? {
            ...day.snacks,
            dishType: day.snacks.dishType as 'homemade' | 'readymade'
          } : emptyMeal
        }))
      };

      await updateWeeklyPlanMutation.mutateAsync({
        id: updatedPlan.id,
        plan: planWithCorrectTypes
      });
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