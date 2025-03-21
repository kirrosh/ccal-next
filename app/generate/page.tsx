'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface for user profile
interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    people_count: 2,
    goal: 'weight_loss',
    preferences: '',
    allergies: '',
    region: 'Россия',
    available_products: ''
  });

  // Load user profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      
      // Calculate calories using the Mifflin-St. Jeor formula
      let bmr;
      if (profile.gender === 'male') {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
      } else {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
      }
      
      // Activity level multipliers
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      
      // Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = Math.round(bmr * activityMultipliers[profile.activityLevel]);
      setCalories(tdee);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert comma-separated strings to arrays
      const preferences = formData.preferences.split(',').map(item => item.trim()).filter(Boolean);
      const allergies = formData.allergies.split(',').map(item => item.trim()).filter(Boolean);
      const available_products = formData.available_products.split(',').map(item => item.trim()).filter(Boolean);

      // API request data
      const requestData: any = {
        people_count: Number(formData.people_count),
        goal: formData.goal,
        preferences,
        allergies,
        region: formData.region,
        available_products
      };

      // Add user profile data if available
      if (userProfile && calories) {
        requestData.user_profile = {
          ...userProfile,
          daily_calories: calories
        };
      }

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const mealPlan = await response.json();
      
      // Save to localStorage
      const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
      savedPlans.push(mealPlan);
      localStorage.setItem('mealPlans', JSON.stringify(savedPlans));
      
      // Navigate to the meal plan page
      router.push(`/meal-plan/${mealPlan.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
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
              <Link href="/generate" className="text-primary hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium">
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Создать новый рацион питания</h1>
          
          {userProfile && calories && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-medium text-blue-800">Информация из профиля</h2>
              <p className="text-sm text-blue-700">
                Ваша суточная потребность: <span className="font-bold">{calories} ккал</span>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Эта информация будет использована для создания оптимального рациона
              </p>
              <Link href="/profile" className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block">
                Изменить профиль
              </Link>
            </div>
          )}
          
          {!userProfile && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h2 className="text-lg font-medium text-yellow-800">Совет</h2>
              <p className="text-sm text-yellow-700">
                Для более точного расчета рациона, рекомендуем создать личный профиль
              </p>
              <Link href="/profile" className="text-sm text-yellow-600 hover:text-yellow-800 underline mt-2 inline-block">
                Создать профиль
              </Link>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="people_count" className="block text-sm font-medium text-gray-700">
                Количество человек
              </label>
              <select
                id="people_count"
                name="people_count"
                value={formData.people_count}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                Цель
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="weight_loss">Похудение</option>
                <option value="muscle_gain">Набор массы</option>
                <option value="maintenance">Поддержание формы</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
                Предпочтения (через запятую)
              </label>
              <textarea
                id="preferences"
                name="preferences"
                rows={2}
                value={formData.preferences}
                onChange={handleChange}
                placeholder="мясо, рыба, овощи"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                Аллергии (через запятую)
              </label>
              <textarea
                id="allergies"
                name="allergies"
                rows={2}
                value={formData.allergies}
                onChange={handleChange}
                placeholder="орехи, молоко, глютен"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                Регион
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="available_products" className="block text-sm font-medium text-gray-700">
                Доступные продукты (через запятую)
              </label>
              <textarea
                id="available_products"
                name="available_products"
                rows={3}
                value={formData.available_products}
                onChange={handleChange}
                placeholder="куриное филе, яйца, овсянка, гречка, рис, картофель, морковь, лук"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Генерация...' : 'Сгенерировать рацион'}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center text-sm text-gray-500">
            <p>© 2023 CCAL. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 