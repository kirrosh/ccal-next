import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Coffee, UtensilsCrossed, Moon, Apple } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import MealCard from './MealCard';
import { Meal, MealType, WeeklyPlan } from '@/types';
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
        breakfast: mealPlan.menu.breakfast[0] || null,
        lunch: mealPlan.menu.lunch[0] || null,
        dinner: mealPlan.menu.dinner[0] || null,
        snacks: mealPlan.menu.snacks[0] || null,
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
    if (currentPlan.days.every(day => Object.values(day).every(meal => meal === null))) {
      const initialDays = DAYS_OF_WEEK.map(() => ({
        breakfast: mealPlan.menu.breakfast[0] || null,
        lunch: mealPlan.menu.lunch[0] || null,
        dinner: mealPlan.menu.dinner[0] || null,
        snacks: mealPlan.menu.snacks[0] || null,
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
            [mealType]: selectedMeal,
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
      (totals, meal) => {
        if (!meal) return totals;
        return {
          calories: totals.calories + meal.nutrients.calories,
          protein: totals.protein + meal.nutrients.protein,
          fats: totals.fats + meal.nutrients.fats,
          carbs: totals.carbs + meal.nutrients.carbs,
        };
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );
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
                    <h3 className="text-lg font-medium">{MEAL_TYPE_LABELS[mealType]}</h3>
                    <div className="w-64">
                      <Select
                        value={String(
                          mealPlan.menu[mealType]?.findIndex(
                            (m: Meal) => m.name === currentPlan.days[dayIndex]?.[mealType]?.name
                          )
                        )}
                        onValueChange={value => handleMealChange(dayIndex, mealType, Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealPlan.menu[mealType]?.map((meal: Meal, index: number) => (
                            <SelectItem key={meal.name} value={String(index)}>
                              {meal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {currentPlan.days[dayIndex] && currentPlan.days[dayIndex][mealType] && (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
                      <MealCard
                        meal={currentPlan.days[dayIndex][mealType] || {}}
                        mealType={mealType}
                        mealPlanId={mealPlan.id || ''}
                        mealIndex={
                          mealPlan.menu[mealType]?.findIndex(
                            (m: Meal) => m.name === currentPlan.days[dayIndex]?.[mealType]?.name
                          ) || 0
                        }
                        onMealUpdated={updatedMeal => {
                          setCurrentPlan(prev => ({
                            ...prev,
                            days: prev.days.map((day, index) => {
                              if (index === dayIndex) {
                                return {
                                  ...day,
                                  [mealType]: updatedMeal,
                                };
                              }
                              return day;
                            }),
                            updatedAt: new Date().toISOString(),
                          }));
                        }}
                      />
                    </div>
                  )}

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
