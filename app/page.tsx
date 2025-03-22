'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import MealPlanView from "@/components/MealPlanView";
import sampleMealPlan from "./data/sampleMealPlan";

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

export default function Home() {
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load meal plans and weekly plans from localStorage
    try {
      const mealPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
      const weekly = JSON.parse(localStorage.getItem('weeklyPlans') || '[]');
      
      setSavedPlans(mealPlans);
      setWeeklyPlans(weekly);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMealPlan = (planId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот рацион?')) {
      try {
        // Remove from meal plans
        const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
        localStorage.setItem('mealPlans', JSON.stringify(updatedPlans));
        setSavedPlans(updatedPlans);
        
        // Also remove any weekly plans based on this meal plan
        const updatedWeeklyPlans = weeklyPlans.filter(plan => plan.mealPlanId !== planId);
        localStorage.setItem('weeklyPlans', JSON.stringify(updatedWeeklyPlans));
        setWeeklyPlans(updatedWeeklyPlans);
        
        // alert('Рацион успешно удален');
      } catch (error) {
        console.error('Error deleting meal plan:', error);
        alert('Ошибка при удалении рациона');
      }
    }
  };

  const deleteWeeklyPlan = (planId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот план на неделю?')) {
      try {
        // Remove weekly plan
        const updatedWeeklyPlans = weeklyPlans.filter(plan => plan.id !== planId);
        localStorage.setItem('weeklyPlans', JSON.stringify(updatedWeeklyPlans));
        setWeeklyPlans(updatedWeeklyPlans);
        
        alert('План на неделю успешно удален');
      } catch (error) {
        console.error('Error deleting weekly plan:', error);
        alert('Ошибка при удалении плана на неделю');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">CCAL</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Мой профиль
              </Link>
              <Link
                href="/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Создать новый рацион
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Ваш персональный рацион питания</h1>
          <p className="text-gray-600">
            Сгенерируйте персональный рацион питания с учетом ваших целей и предпочтений.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Meal Plans Section */}
            {savedPlans.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Ваши рационы</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium mb-2">Рацион питания</h3>
                        <button 
                          onClick={() => deleteMealPlan(plan.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none" 
                          aria-label="Удалить рацион"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Создан: {new Date(plan.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-auto flex flex-col space-y-2">
                        <Link
                          href={`/meal-plan/${plan.id}`}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          Открыть рацион →
                        </Link>
                        <Link
                          href={`/weekly-plan/${plan.id}`}
                          className="text-gray-600 hover:text-primary text-sm"
                        >
                          План на неделю →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Weekly Plans Section */}
            {weeklyPlans.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Ваши планы на неделю</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weeklyPlans.map((plan) => {
                    // Find the associated meal plan
                    const mealPlan = savedPlans.find(mp => mp.id === plan.mealPlanId);
                    
                    return (
                      <div key={plan.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium mb-2">План питания на неделю</h3>
                          <button 
                            onClick={() => deleteWeeklyPlan(plan.id)}
                            className="text-red-500 hover:text-red-700 focus:outline-none" 
                            aria-label="Удалить план на неделю"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          Создан: {new Date(plan.createdAt).toLocaleString()}
                        </p>
                        {mealPlan && (
                          <p className="text-sm text-gray-500 mb-4">
                            На основе рациона от: {new Date(mealPlan.createdAt).toLocaleString()}
                          </p>
                        )}
                        <div className="mt-auto">
                          <Link
                            href={`/weekly-plan/${plan.mealPlanId}`}
                            className="text-primary hover:text-primary-dark font-medium"
                          >
                            Открыть план на неделю →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {savedPlans.length === 0 && weeklyPlans.length === 0 && (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">У вас пока нет сохраненных рационов</h2>
                <p className="text-gray-600 mb-4">
                  Создайте свой первый персональный рацион питания, учитывающий ваши цели и предпочтения.
                </p>
                <Link
                  href="/generate"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Создать рацион
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center text-sm text-gray-500">
            <p>© 2025 CCAL. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
