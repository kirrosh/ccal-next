import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Nutrients {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

interface MealCardProps {
  name: string;
  dishType: "homemade" | "readymade";
  ingredients: Ingredient[];
  nutrients: Nutrients;
  servingSize: number;
}

const MealCard: React.FC<MealCardProps> = ({
  name,
  dishType,
  ingredients,
  nutrients,
  servingSize
}) => {
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl leading-tight">{name}</CardTitle>
          <Badge variant={dishType === "homemade" ? "default" : "secondary"} className="ml-2 shrink-0">
            {dishType === "homemade" ? "Домашнее" : "Готовое"}
          </Badge>
        </div>
        <CardDescription>
          {ingredients.length} ингредиентов • {nutrients.calories} ккал • Порция: {servingSize} г
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow flex flex-col">
        <div className="space-y-4 flex flex-col h-full">
          <div>
            <h4 className="text-sm font-medium mb-2">Ингредиенты:</h4>
            <ul className="text-sm space-y-1">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between">
                  <span className="mr-2">{ingredient.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">{ingredient.amount} {ingredient.unit}</span>
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
                  <span className="font-medium">{nutrients.calories}</span>
                  <span className="text-xs text-muted-foreground">ккал</span>
                </div>
                <div className="flex flex-col items-center p-1 rounded-md bg-blue-50">
                  <span className="font-medium">{nutrients.protein}г</span>
                  <span className="text-xs text-muted-foreground">белки</span>
                </div>
                <div className="flex flex-col items-center p-1 rounded-md bg-yellow-50">
                  <span className="font-medium">{nutrients.fats}г</span>
                  <span className="text-xs text-muted-foreground">жиры</span>
                </div>
                <div className="flex flex-col items-center p-1 rounded-md bg-green-50">
                  <span className="font-medium">{nutrients.carbs}г</span>
                  <span className="text-xs text-muted-foreground">углев.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard; 