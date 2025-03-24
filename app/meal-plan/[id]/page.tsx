'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MealPlanView from '@/components/MealPlanView';

import { api } from '@/trpc/react';

export default function MealPlanPage() {
  const params = useParams();
  // const router = useRouter();
  // const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const id = params.id as string;

  const { data: mealPlan, isLoading } = api.meal.getMealPlan.useQuery({ id });
  console.log(mealPlan)


  const handleDelete = () => {
    if (mealPlan && confirm('Вы уверены, что хотите удалить этот рацион?')) {
      try {
        // deleteMealPlan(mealPlan.id);
        // router.push('/');
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-primary">CCAL</Link>
              <Link href="/generate" className="text-sm font-medium text-gray-700 hover:text-primary">
                Создать новый рацион
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-gray-600">Загрузка рациона...</p>
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-3">Рацион питания</h1>
                  <p className="text-gray-600">
                    Создан: {new Date(mealPlan.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Удалить рацион
                  </button>
                  <Link 
                    href={`/weekly-plan/${mealPlan.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Составить план на неделю
                  </Link>
                </div>
              </div>
            </div>
            
            <MealPlanView mealPlan={mealPlan as any} />
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