'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WeeklyPlanView from '@/components/WeeklyPlanView';

// Define types
interface MealPlan {
  id: string;
  createdAt: string;
  [key: string]: any;
}

interface WeeklyPlan {
  id: string;
  mealPlanId: string;
  createdAt: string;
  days: {
    [key: string]: any;
  };
}

export default function WeeklyPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params.id as string;
    
    // Retrieve meal plan from localStorage
    try {
      const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
      const foundPlan = savedPlans.find((plan: any) => plan.id === id);
      
      if (foundPlan) {
        setMealPlan(foundPlan);
        
        // Check if there's a weekly plan based on this meal plan
        const savedWeeklyPlans = JSON.parse(localStorage.getItem('weeklyPlans') || '[]');
        const foundWeeklyPlan = savedWeeklyPlans.find(
          (plan: WeeklyPlan) => plan.mealPlanId === id
        );
        
        if (foundWeeklyPlan) {
          setWeeklyPlan(foundWeeklyPlan);
        }
      } else {
        setError('Рацион не найден');
      }
    } catch (err) {
      console.error('Error loading meal plan:', err);
      setError('Ошибка при загрузке рациона');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const handleDeleteWeeklyPlan = () => {
    if (weeklyPlan && confirm('Вы уверены, что хотите удалить этот план на неделю?')) {
      try {
        // Remove weekly plan
        const savedWeeklyPlans = JSON.parse(localStorage.getItem('weeklyPlans') || '[]');
        const updatedWeeklyPlans = savedWeeklyPlans.filter(
          (plan: WeeklyPlan) => plan.id !== weeklyPlan.id
        );
        localStorage.setItem('weeklyPlans', JSON.stringify(updatedWeeklyPlans));
        
        // Redirect to home page
        router.push('/');
        alert('План на неделю успешно удален');
      } catch (error) {
        console.error('Error deleting weekly plan:', error);
        alert('Ошибка при удалении плана на неделю');
      }
    }
  };

  const handleSaveWeeklyPlan = (plan: WeeklyPlan) => {
    try {
      // Save to localStorage
      const savedWeeklyPlans = JSON.parse(localStorage.getItem('weeklyPlans') || '[]');
      
      // Check if this plan already exists
      const existingPlanIndex = savedWeeklyPlans.findIndex(
        (p: WeeklyPlan) => p.id === plan.id
      );
      
      if (existingPlanIndex >= 0) {
        // Update existing plan
        savedWeeklyPlans[existingPlanIndex] = plan;
      } else {
        // Add new plan
        savedWeeklyPlans.push(plan);
      }
      
      localStorage.setItem('weeklyPlans', JSON.stringify(savedWeeklyPlans));
      setWeeklyPlan(plan);
      
      // Show success message
      alert('План питания на неделю успешно сохранен!');
    } catch (err) {
      console.error('Error saving weekly plan:', err);
      alert('Ошибка при сохранении плана питания на неделю');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-primary">CCAL</Link>
              <Link href="/generate" className="text-sm font-medium text-gray-700 hover:text-primary">
                Создать новый рацион
              </Link>
              <Link href={`/meal-plan/${params.id}`} className="text-sm font-medium text-gray-700 hover:text-primary">
                Вернуться к рациону
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-gray-600">Загрузка данных...</p>
          </div>
        ) : error ? (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">{error}</h1>
              <p className="mt-2 text-gray-600">Возможно, рацион был удален или его ID неверный.</p>
              <div className="mt-6">
                <Link 
                  href="/generate"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Создать новый рацион
                </Link>
              </div>
            </div>
          </div>
        ) : mealPlan && (
          <>
            <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
              <h1 className="text-2xl font-bold mb-3">Недельный план питания</h1>
              <p className="text-gray-600">
                Создан: {new Date(weeklyPlan?.createdAt || new Date()).toLocaleString()}
              </p>
              <p className="text-gray-600">
                На основе рациона от: {new Date(mealPlan.createdAt).toLocaleString()}
              </p>
              {weeklyPlan && (
                <div className="mt-4">
                  <button
                    onClick={handleDeleteWeeklyPlan}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Удалить план на неделю
                  </button>
                </div>
              )}
            </div>
            
            <WeeklyPlanView 
              mealPlan={mealPlan} 
              weeklyPlan={weeklyPlan || undefined} 
              onSave={handleSaveWeeklyPlan} 
            />
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center text-sm text-gray-500">
            <p>© 2025 CCAL. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 