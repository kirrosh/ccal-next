'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MealPlanView from '@/components/MealPlanView';

// Define a simplified type for meal plan
interface MealPlan {
  id: string;
  createdAt: string;
  [key: string]: any; // Allow for other properties
}

export default function MealPlanPage() {
  const params = useParams();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params.id as string;
    
    // Retrieve from localStorage
    try {
      const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
      const foundPlan = savedPlans.find((plan: any) => plan.id === id);
      
      if (foundPlan) {
        setMealPlan(foundPlan);
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
        {loading ? (
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
                <div className="mt-4 sm:mt-0">
                  <Link 
                    href={`/weekly-plan/${mealPlan.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Составить план на неделю
                  </Link>
                </div>
              </div>
            </div>
            
            <MealPlanView mealPlan={mealPlan} />
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