'use client';

import { useState,  } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useToast } from '@/components/ui/use-toast';

export default function GeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calories, setCalories] = useState<number | null>(null);
  const generateMealPlanMutation = api.meal.generateMealPlan.useMutation();
  const [formData, setFormData] = useState({
    name: '',
    preferences: '',
    allergies: '',
    region: 'Россия',
    available_products: '',
  });
  const { data: profile } = api.profile.getProfile.useQuery();


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert comma-separated strings to arrays
      const preferences = formData.preferences
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      const allergies = formData.allergies.split(',').map(item => item.trim()).filter(Boolean);
      const available_products = formData.available_products.split(',').map(item => item.trim()).filter(Boolean);

      if (!profile) {
        throw new Error('Profile not found');
      }

      const result = await generateMealPlanMutation.mutateAsync({
        profile: {
          userId: profile?.userId as string,
          gender: profile?.gender as 'male' | 'female',
          age: profile?.age,
          height: profile?.height,
          weight: profile?.weight,
          activityLevel: profile?.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
          daily_calories: profile?.daily_calories || undefined,
        },
        preferences: {
          cuisine: formData.region,
          dietaryRestrictions: preferences,
          mealCount: 7,
          allergies: allergies,
          availableProducts: available_products,
        },
        name: formData.name
      });

      // Navigate to the meal plan page
      router.push(`/meal-plan/${result}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать рацион. Пожалуйста, попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Создать новый рацион питания</h1>

          {profile && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                Возраст: <span className="font-bold">{profile.age}</span> лет
              </p>
              <p className="text-sm text-green-700">
                Пол: <span className="font-bold">{profile.gender === 'male' ? 'Мужской' : 'Женский'}</span>
              </p>
              <p className="text-sm text-green-700">
                Вес: <span className="font-bold">{profile.weight}</span> кг
              </p>
              <p className="text-sm text-green-700">
                Рост: <span className="font-bold">{profile.height}</span> см
              </p>
              <p className="text-sm text-green-700">
                Уровень активности: <span className="font-bold">{profile.activityLevel}</span>
              </p>
            </div>
          )}

          {calories && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-medium text-blue-800">Информация из профиля</h2>
              <p className="text-sm text-blue-700">
                Ваша суточная потребность: <span className="font-bold">{calories} ккал</span>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Эта информация будет использована для создания оптимального рациона
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Название рациона
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Летний рацион"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
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
                Аллергии и нежелательные продукты (через запятую)
              </label>
              <textarea
                id="allergies"
                name="allergies"
                rows={3}
                value={formData.allergies}
                onChange={handleChange}
                placeholder="орехи, молоко, глютен, грибы, баклажаны, морепродукты"
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
              <label
                htmlFor="available_products"
                className="block text-sm font-medium text-gray-700"
              >
                Имеющиеся продукты (через запятую)
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
    </div>
  );
}
