import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Coffee, UtensilsCrossed, Moon, Apple, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import MealCard from './MealCard';
import { MealType, WeeklyPlan } from '@/types';
import { MealPlan } from '@/schemas/meal';
import { useRouter } from 'next/navigation';

interface WeeklyPlanViewProps {
  mealPlan: MealPlan;
  weeklyPlan?: WeeklyPlan;
  onSave: (weeklyPlan: WeeklyPlan) => Promise<void>;
}

const DAYS_OF_WEEK = ['День 1', 'День 2', 'День 3', 'День 4', 'День 5', 'День 6', 'День 7'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snacks: 'Перекус',
};

const MEAL_ICONS = {
  breakfast: <Coffee size={20} />,
  lunch: <UtensilsCrossed size={20} />,
  dinner: <Moon size={20} />,
  snacks: <Apple size={20} />,
} as const;

const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ mealPlan, weeklyPlan, onSave }) => {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan>(
    weeklyPlan || {
      id: crypto.randomUUID(),
      userId: mealPlan.userId,
      mealPlanId: mealPlan.id || '',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      days: DAYS_OF_WEEK.map(() => ({
        breakfast: mealPlan.menu.breakfast[0] ? [mealPlan.menu.breakfast[0]] : [],
        lunch: mealPlan.menu.lunch[0] ? [mealPlan.menu.lunch[0]] : [],
        dinner: mealPlan.menu.dinner[0] ? [mealPlan.menu.dinner[0]] : [],
        snacks: mealPlan.menu.snacks[0] ? [mealPlan.menu.snacks[0]] : [],
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      v: 0,
    }
  );

  const [activeDay, setActiveDay] = useState<string>('День 1');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize empty plan if none exists
  useEffect(() => {
    if (currentPlan.days.every(day => Object.values(day).every(meals => meals.length === 0))) {
      const initialDays = DAYS_OF_WEEK.map(() => ({
        breakfast: mealPlan.menu.breakfast[0] ? [mealPlan.menu.breakfast[0]] : [],
        lunch: mealPlan.menu.lunch[0] ? [mealPlan.menu.lunch[0]] : [],
        dinner: mealPlan.menu.dinner[0] ? [mealPlan.menu.dinner[0]] : [],
        snacks: mealPlan.menu.snacks[0] ? [mealPlan.menu.snacks[0]] : [],
      }));

      setCurrentPlan(prev => ({
        ...prev,
        days: initialDays,
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [mealPlan.menu, currentPlan.days]);

  const handleMealChange = (dayIndex: number, mealType: MealType, mealIndex: number) => {
    const selectedMeal = mealPlan.menu[mealType]?.[mealIndex];
    if (!selectedMeal) return;

    setCurrentPlan(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            [mealType]: [selectedMeal, ...day[mealType]],
          };
        }
        return day;
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRemoveMeal = (dayIndex: number, mealType: MealType, mealIndex: number) => {
    setCurrentPlan(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            [mealType]: day[mealType].filter((_, i) => i !== mealIndex),
          };
        }
        return day;
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleClearMeals = (dayIndex: number, mealType: MealType) => {
    setCurrentPlan(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            [mealType]: [],
          };
        }
        return day;
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(currentPlan);
      router.refresh();
    } catch (error) {
      console.error('Error saving weekly plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDailyTotals = (dayIndex: number) => {
    if (!currentPlan.days[dayIndex]) return { calories: 0, protein: 0, fats: 0, carbs: 0 };

    const meals = currentPlan.days[dayIndex];
    return Object.values(meals).reduce(
      (totals, mealList) => {
        return mealList.reduce(
          (mealTotals, meal) => {
            if (!meal) return mealTotals;
            return {
              calories: mealTotals.calories + meal.nutrients.calories,
              protein: mealTotals.protein + meal.nutrients.protein,
              fats: mealTotals.fats + meal.nutrients.fats,
              carbs: mealTotals.carbs + meal.nutrients.carbs,
            };
          },
          totals
        );
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );
  };

  const navigateMeal = (dayIndex: number, mealType: MealType, mealIndex: number, direction: 'prev' | 'next') => {
    const meals = mealPlan.menu[mealType];
    if (!meals) return;

    const currentMeal = currentPlan.days[dayIndex][mealType][mealIndex];
    const currentIndex = meals.findIndex(m => m.name === currentMeal.name);
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + meals.length) % meals.length
      : (currentIndex + 1) % meals.length;

    setCurrentPlan(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            [mealType]: day[mealType].map((m, i) => 
              i === mealIndex ? meals[newIndex] : m
            ),
          };
        }
        return day;
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">План питания на неделю</h2>
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary-dark"
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить план'}
        </Button>
      </div>

      <Tabs defaultValue="День 1" value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-cols-7 mb-8">
          {DAYS_OF_WEEK.map(day => (
            <TabsTrigger key={day} value={day} className="text-xs sm:text-sm">
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS_OF_WEEK.map((_, dayIndex) => (
          <TabsContent key={dayIndex} value={DAYS_OF_WEEK[dayIndex]}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{DAYS_OF_WEEK[dayIndex]}</span>
                  <div className="text-sm font-normal flex gap-3">
                    <span>Всего: {calculateDailyTotals(dayIndex).calories} ккал</span>
                    <span>Б: {calculateDailyTotals(dayIndex).protein}г</span>
                    <span>Ж: {calculateDailyTotals(dayIndex).fats}г</span>
                    <span>У: {calculateDailyTotals(dayIndex).carbs}г</span>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-8">
              {MEAL_TYPES.map(mealType => (
                <div key={mealType} className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {MEAL_ICONS[mealType]}
                      <h3 className="text-lg font-medium">{MEAL_TYPE_LABELS[mealType]}</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMealChange(dayIndex, mealType, 0)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Добавить
                    </Button>
                    {currentPlan.days[dayIndex][mealType].length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClearMeals(dayIndex, mealType)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Очистить
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
                    {currentPlan.days[dayIndex][mealType].map((meal, mealIndex) => (
                      <div key={mealIndex} className="relative">
                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateMeal(dayIndex, mealType, mealIndex, 'prev')}
                            className="rounded-full"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateMeal(dayIndex, mealType, mealIndex, 'next')}
                            className="rounded-full"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveMeal(dayIndex, mealType, mealIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <MealCard
                          meal={meal}
                          mealType={mealType}
                          mealPlanId={mealPlan.id || ''}
                          mealIndex={mealIndex}
                          onMealUpdated={updatedMeal => {
                            setCurrentPlan(prev => ({
                              ...prev,
                              days: prev.days.map((day, index) => {
                                if (index === dayIndex) {
                                  return {
                                    ...day,
                                    [mealType]: day[mealType].map((m, i) =>
                                      i === mealIndex ? updatedMeal : m
                                    ),
                                  };
                                }
                                return day;
                              }),
                              updatedAt: new Date().toISOString(),
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {mealType !== 'snacks' && <Separator className="my-6" />}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WeeklyPlanView;
