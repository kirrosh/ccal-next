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

export default function Home() {
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load meal plans from localStorage
    try {
      const plans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved meal plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">CCAL</span>
            </div>
            <div>
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
        ) : savedPlans.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-6">Ваши рационы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {savedPlans.map((plan) => (
                <div key={plan.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                  <h3 className="text-lg font-medium mb-2">Рацион питания</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Создан: {new Date(plan.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-auto">
                    <Link
                      href={`/meal-plan/${plan.id}`}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Открыть рацион →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-[24px] flex-wrap items-center justify-center">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Go to nextjs.org →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
