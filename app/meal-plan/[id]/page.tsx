'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MealPlanView from '@/components/MealPlanView';
import { api } from '@/trpc/react';

export default function MealPlanPage() {
  const params = useParams();
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const id = params.id as string;
  const utils = api.useUtils();

  const { data: mealPlan, isLoading } = api.meal.getMealPlan.useQuery({ id });
  const updateNameMutation = api.meal.updateMealPlanName.useMutation({
    onSuccess: () => {
      utils.meal.getMealPlan.invalidate({ id });
      setIsEditing(false);
    },
    onError: error => {
      console.error('Error updating name:', error);
      setError('Ошибка при обновлении имени рациона');
    },
  });

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

  const handleNameEdit = () => {
    if (mealPlan) {
      setEditedName(mealPlan.name);
      setIsEditing(true);
    }
  };

  const handleNameSave = () => {
    if (mealPlan && editedName.trim()) {
      updateNameMutation.mutate({ id: mealPlan.id, name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setIsEditing(false);
    setEditedName('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        ) : (
          mealPlan && (
            <>
              <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={e => setEditedName(e.target.value)}
                          className="text-2xl font-bold border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleNameSave();
                            if (e.key === 'Escape') handleNameCancel();
                          }}
                        />
                        <button
                          onClick={handleNameSave}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={handleNameCancel}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold">{mealPlan.name}</h1>
                        <button
                          onClick={handleNameEdit}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          ✎
                        </button>
                      </div>
                    )}
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
          )
        )}
      </main>
    </div>
  );
}
