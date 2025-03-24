import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Apple
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import MealCard from './MealCard';
import { Meal, MealType, MealPlan, WeeklyPlan } from '@/types';

interface WeeklyPlanViewProps {
  mealPlan: MealPlan;
  weeklyPlan?: WeeklyPlan;
  onSave: (weeklyPlan: WeeklyPlan) => void;
}

const DAYS_OF_WEEK = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snacks: 'Перекус'
};

const MEAL_ICONS = {
  'breakfast': <Coffee size={20} />,
  'lunch': <UtensilsCrossed size={20} />,
  'dinner': <Moon size={20} />,
  'snacks': <Apple size={20} />
} as const;
const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ mealPlan, weeklyPlan, onSave }) => {
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan>(weeklyPlan || {
    id: crypto.randomUUID(),
    userId: mealPlan.userId,
    mealPlanId: mealPlan.id || "",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    days: {},
    mealPlans: [mealPlan],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  const [activeDay, setActiveDay] = useState<string>('Понедельник');
  
  // Initialize empty plan if none exists
  useEffect(() => {
    if (Object.keys(currentPlan.days).length === 0) {
      const initialDays = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = MEAL_TYPES.reduce((meals, type) => {
          meals[type] = mealPlan.menu[type]?.[0];
          return meals;
        }, {} as Record<MealType, Meal>);
        return acc;
      }, {} as Record<string, Record<MealType, Meal>>);
      
      setCurrentPlan(prev => ({
        ...prev,
        days: initialDays,
        updatedAt: new Date().toISOString()
      }));
    }
  }, [mealPlan.menu, currentPlan.days]);

  const handleMealChange = (day: string, mealType: MealType, index: number) => {
    const selectedMeal = mealPlan.menu[mealType]?.[index];
    if (!selectedMeal) return;

    setCurrentPlan(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [mealType]: selectedMeal
        }
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const calculateDailyTotals = (day: string) => {
    if (!currentPlan.days[day]) return { calories: 0, protein: 0, fats: 0, carbs: 0 };
    
    const meals = currentPlan.days[day];
    return Object.values(meals).reduce((totals, meal) => {
      return {
        calories: totals.calories + meal.nutrients.calories,
        protein: totals.protein + meal.nutrients.protein,
        fats: totals.fats + meal.nutrients.fats,
        carbs: totals.carbs + meal.nutrients.carbs
      };
    }, { calories: 0, protein: 0, fats: 0, carbs: 0 });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">План питания на неделю</h2>
        <Button onClick={() => onSave(currentPlan)} className="bg-primary hover:bg-primary-dark">
          Сохранить план
        </Button>
      </div>
      
      <Tabs defaultValue="Понедельник" value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-cols-7 mb-8">
          {DAYS_OF_WEEK.map(day => (
            <TabsTrigger key={day} value={day} className="text-xs sm:text-sm">
              {day}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {DAYS_OF_WEEK.map((day) => (
          <TabsContent key={day} value={day}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{day}</span>
                  <div className="text-sm font-normal flex gap-3">
                    <span>Всего: {calculateDailyTotals(day).calories} ккал</span>
                    <span>Б: {calculateDailyTotals(day).protein}г</span>
                    <span>Ж: {calculateDailyTotals(day).fats}г</span>
                    <span>У: {calculateDailyTotals(day).carbs}г</span>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
            
            <div className="space-y-8">
              {MEAL_TYPES.map((mealType) => (
                <div key={mealType} className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{MEAL_TYPE_LABELS[mealType]}</h3>
                    <div className="w-64">
                      <Select 
                        value={String(mealPlan.menu[mealType]?.findIndex(
                          (m: Meal) => m.name === currentPlan.days[day]?.[mealType]?.name
                        ))}
                        onValueChange={(value) => handleMealChange(day, mealType, Number(value))}
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
                  
                  {currentPlan.days[day] && currentPlan.days[day][mealType] && (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
                      <MealCard
                        meal={currentPlan.days[day][mealType] || {}}
                        mealType={mealType}
                        mealPlanId={mealPlan.id || ''}
                        onMealUpdated={(updatedMeal) => {
                          setCurrentPlan(prev => ({
                            ...prev,
                            days: {
                              ...prev.days,
                              [day]: {
                                ...prev.days[day],
                                [mealType]: updatedMeal
                              }
                            },
                            updatedAt: new Date().toISOString()
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