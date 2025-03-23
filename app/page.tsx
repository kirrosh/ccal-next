'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MealPlan } from '@/types';
import { useStorage } from '@/hooks/useStorage';

export default function Home() {
  const { getMealPlans, deleteMealPlan } = useStorage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const mealPlans = getMealPlans();

  const handleDeleteMealPlan = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот рацион?')) {
      try {
        deleteMealPlan(id);
        alert('Рацион успешно удален');
      } catch (error) {
        console.error('Error deleting meal plan:', error);
        alert('Ошибка при удалении рациона');
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
              <Link href="/" className="text-xl font-bold text-primary">CCAL</Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/generate" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Создать рацион
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Мой профиль
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Добро пожаловать в CCAL</h1>
          <p className="text-gray-600 mb-6">
            Создавайте персонализированные планы питания с учетом ваших предпочтений и целей.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Создать новый рацион
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : (
          <div>
            {mealPlans.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-6">Ваши рационы</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mealPlans.map((plan) => (
                    <div key={plan.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium mb-2">Рацион питания</h3>
                        <button 
                          onClick={() => handleDeleteMealPlan(plan.id || '')}
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
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Просмотреть рацион
                        </Link>
                        <Link
                          href={`/weekly-plan/${plan.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          План на неделю
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">У вас пока нет сохраненных рационов.</p>
                <Link
                  href="/generate"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Создать первый рацион
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center text-sm text-gray-500">
            <p>© 2023 CCAL. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
