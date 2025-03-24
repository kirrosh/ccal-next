'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WeeklyPlanView from '@/components/WeeklyPlanView';
import {  WeeklyPlan } from '@/types';
import { useStorage } from '@/hooks/useStorage';
import { MealPlan } from '@/schemas/meal';

export default function WeeklyPlanPage() {
  const router = useRouter();
  const { 
    deleteWeeklyPlan,
    addWeeklyPlan,
    updateWeeklyPlan 
  } = useStorage();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const id = params.id as string;
    
  //   try {
  //     const foundPlan = getMealPlanById(id);
      
  //     if (foundPlan) {
  //       setMealPlan(foundPlan);
        
  //       // Check if there's a weekly plan based on this meal plan
  //       const foundWeeklyPlan = getWeeklyPlanByMealPlanId(id);
  //       if (foundWeeklyPlan) {
  //         setWeeklyPlan(foundWeeklyPlan);
  //       }
  //     } else {
  //       setError('Рацион не найден');
  //     }
  //   } catch (err) {
  //     console.error('Error loading meal plan:', err);
  //     setError('Ошибка при загрузке рациона');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [params.id]);

  const handleDeleteWeeklyPlan = () => {
    if (!weeklyPlan) return;
    
    if (confirm('Вы уверены, что хотите удалить недельный план?')) {
      try {
        deleteWeeklyPlan(weeklyPlan.id);
        router.push('/');
      } catch (err) {
        console.error('Error deleting weekly plan:', err);
        setError('Ошибка при удалении недельного плана');
      }
    }
  };

  const handleCreateWeeklyPlan = () => {
    if (!mealPlan) return;

    try {
      const newWeeklyPlan: WeeklyPlan = {
        id: crypto.randomUUID(),
        userId: mealPlan.userId,
        mealPlanId: mealPlan.id || "",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        days: {},
        mealPlans: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addWeeklyPlan(newWeeklyPlan);
      setWeeklyPlan(newWeeklyPlan);
    } catch (err) {
      console.error('Error creating weekly plan:', err);
      setError('Ошибка при создании недельного плана');
    }
  };

  const handleUpdateWeeklyPlan = (updatedPlan: WeeklyPlan) => {
    try {
      updateWeeklyPlan(updatedPlan.id, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (err) {
      console.error('Error updating weekly plan:', err);
      setError('Ошибка при обновлении недельного плана');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
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
          weeklyPlan={weeklyPlan}
          mealPlan={mealPlan}
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