import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@/components/ui/use-toast';
import { Meal, MealType } from '@/types';
import { api } from '@/trpc/react';

interface MealCardProps {
  meal: Meal;
  mealType: MealType;
  mealPlanId: string;
  mealIndex: number;
  onMealUpdated?: (meal: Meal) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, mealType, mealPlanId, mealIndex }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data: profile } = api.profile.getProfile.useQuery();

  const regenerateMealMutation = api.meal.regenerateMeal.useMutation({
    onError: error => {
      console.error('Regenerate meal error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось сгенерировать новое блюдо',
      });
    },
    onSettled: () => {
      setIsRegenerating(false);
    },
  });

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      console.log('Regenerating meal with profile:', profile);

      await regenerateMealMutation.mutateAsync({
        mealType,
        mealPlanId,
        mealIndex,
        preferences: {
          cuisine: undefined,
          dietaryRestrictions: [],
        },
        profile: {
          userId: profile?.userId as string,
          gender: profile?.gender as 'male' | 'female',
          age: profile?.age as number,
          height: profile?.height as number,
          weight: profile?.weight as number,
          activityLevel: profile?.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
          daily_calories: profile?.daily_calories  || undefined,
        },
      });
      utils.meal.getMealPlan.invalidate({ id: mealPlanId });
    } catch (error) {
      console.error('Error regenerating meal:', error);
    }
  };

  return (
    <Card
      className={`w-full h-full flex flex-col overflow-hidden transition-all hover:shadow-md relative ${isRegenerating ? 'opacity-50' : ''}`}
    >
      {isRegenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <ReloadIcon className="h-8 w-8 animate-spin" />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl leading-tight">{meal.name}</CardTitle>
          <Badge
            variant={meal.dishType === 'homemade' ? 'default' : 'secondary'}
            className="ml-2 shrink-0"
          >
            {meal.dishType === 'homemade' ? 'Домашнее' : 'Готовое'}
          </Badge>
        </div>
        <CardDescription>
          {meal.ingredients.length} ингредиентов • {meal.nutrients.calories} ккал • Порция:{' '}
          {meal.servingSize} г
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2 flex-grow flex flex-col">
        <div className="space-y-4 flex flex-col h-full">
          <div>
            <h4 className="text-sm font-medium mb-2">Ингредиенты:</h4>
            <ul className="text-sm space-y-1">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between">
                  <span className="mr-2">{ingredient.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-4">
            <Separator className="mb-4" />

            <div>
              <h4 className="text-sm font-medium mb-2">Нутриенты:</h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="flex flex-col items-center p-1 rounded-md bg-primary/5">
                  <span className="font-medium">{meal.nutrients.calories}</span>
                  <span className="text-xs text-muted-foreground">ккал</span>
                </div>
                <div className="flex flex-col items-center p-1 rounded-md bg-blue-50">
                  <span className="font-medium">{meal.nutrients.protein}г</span>
                  <span className="text-xs text-muted-foreground">белки</span>
                </div>
                <div className="flex flex-col items-center p-1 rounded-md bg-yellow-50">
                  <span className="font-medium">{meal.nutrients.fats}г</span>
                  <span className="text-xs text-muted-foreground">жиры</span>
                </div>
                <div className="flex flex-col items-center p-1 rounded-md bg-green-50">
                  <span className="font-medium">{meal.nutrients.carbs}г</span>
                  <span className="text-xs text-muted-foreground">углев.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full  mb-3 "
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <ReloadIcon className="mr-2h-4 w-4 animate-spin" />
              Генерация...
            </>
          ) : (
            'Заменить блюдо'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MealCard;
