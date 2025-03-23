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
import { Meal, MealType, MealPlan, DailyMenu } from '@/types';

interface WeeklyPlan {
  id: string;
  mealPlanId: string;
  createdAt: string;
  days: Record<string, {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  }>;
}

interface WeeklyPlanViewProps {
  mealPlan: MealPlan;
  weeklyPlan?: WeeklyPlan;
  onSave: (weeklyPlan: WeeklyPlan) => void;
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

const DAY_NAMES_RU = {
  'monday': 'Понедельник',
  'tuesday': 'Вторник',
  'wednesday': 'Среда',
  'thursday': 'Четверг',
  'friday': 'Пятница',
  'saturday': 'Суббота',
  'sunday': 'Воскресенье'
} as const;

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const MEAL_NAMES_RU = {
  'breakfast': 'Завтрак',
  'lunch': 'Обед',
  'dinner': 'Ужин',
  'snack': 'Перекус'
} as const;

const MEAL_ICONS = {
  'breakfast': <Coffee size={20} />,
  'lunch': <UtensilsCrossed size={20} />,
  'dinner': <Moon size={20} />,
  'snack': <Apple size={20} />
} as const;

const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ mealPlan, weeklyPlan, onSave }) => {
  const [currentWeeklyPlan, setCurrentWeeklyPlan] = useState<WeeklyPlan>({
    id: weeklyPlan?.id || crypto.randomUUID(),
    mealPlanId: mealPlan.id || crypto.randomUUID(),
    createdAt: weeklyPlan?.createdAt || new Date().toISOString(),
    days: weeklyPlan?.days || {}
  });
  
  const [activeDay, setActiveDay] = useState<string>('monday');
  
  // Initialize empty plan if none exists
  useEffect(() => {
    if (Object.keys(currentWeeklyPlan.days).length === 0) {
      const initialDays = DAYS_OF_WEEK.reduce((acc, day) => {
        // Select first meal of each type by default
        acc[day] = {
          breakfast: mealPlan.menu.breakfast[0],
          lunch: mealPlan.menu.lunch[0],
          dinner: mealPlan.menu.dinner[0],
          snack: mealPlan.menu.snack[0]
        };
        return acc;
      }, {} as Record<string, {
        breakfast: Meal;
        lunch: Meal;
        dinner: Meal;
        snack: Meal;
      }>);
      
      setCurrentWeeklyPlan(prev => ({
        ...prev,
        days: initialDays
      }));
    }
  }, [mealPlan.menu, currentWeeklyPlan.days]);

  // Handle meal selection change
  const handleMealChange = (day: string, mealType: MealType, mealIndex: string) => {
    const index = parseInt(mealIndex);
    if (isNaN(index)) return;

    const selectedMeal = mealPlan.menu[mealType][index];
    if (!selectedMeal) return;

    setCurrentWeeklyPlan(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [mealType]: selectedMeal
        }
      }
    }));
  };

  // Save weekly plan
  const handleSave = () => {
    onSave(currentWeeklyPlan);
  };

  // Calculate daily totals
  const calculateDailyTotals = (day: string) => {
    if (!currentWeeklyPlan.days[day]) return { calories: 0, protein: 0, fats: 0, carbs: 0 };
    
    const meals = currentWeeklyPlan.days[day];
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
        <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark">
          Сохранить план
        </Button>
      </div>
      
      <Tabs defaultValue="monday" value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-cols-7 mb-8">
          {DAYS_OF_WEEK.map(day => (
            <TabsTrigger key={day} value={day} className="text-xs sm:text-sm">
              {DAY_NAMES_RU[day as keyof typeof DAY_NAMES_RU]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {DAYS_OF_WEEK.map(day => (
          <TabsContent key={day} value={day}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{DAY_NAMES_RU[day as keyof typeof DAY_NAMES_RU]}</span>
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
              {MEAL_TYPES.map(mealType => (
                <div key={mealType}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{MEAL_ICONS[mealType as keyof typeof MEAL_ICONS]}</span>
                      <h3 className="text-xl font-semibold">{MEAL_NAMES_RU[mealType as keyof typeof MEAL_NAMES_RU]}</h3>
                    </div>
                    
                    <Select 
                      value={mealPlan.menu[mealType as keyof typeof mealPlan.menu].findIndex(
                        (m: Meal) => m.name === currentWeeklyPlan.days[day]?.[mealType as keyof DailyMenu]?.name
                      ).toString()} 
                      onValueChange={(value) => handleMealChange(day, mealType as MealType, value)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Выберите блюдо" />
                      </SelectTrigger>
                      <SelectContent>
                        {mealPlan.menu[mealType as keyof typeof mealPlan.menu].map((meal: Meal, index: number) => (
                          <SelectItem key={index} value={index.toString()}>
                            {meal.name} ({meal.nutrients.calories} ккал)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {currentWeeklyPlan.days[day] && currentWeeklyPlan.days[day][mealType as keyof DailyMenu] && (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
                      <MealCard
                        meal={currentWeeklyPlan.days[day][mealType as keyof DailyMenu]}
                        mealType={mealType as keyof DailyMenu}
                        onMealUpdated={(meal) => {
                          console.log(meal);
                        }}
                      />
                    </div>
                  )}
                  {mealType !== 'snack' && <Separator className="my-8" />}
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