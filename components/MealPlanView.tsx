import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Apple,
  Utensils,
  MessageCircleWarning,
  HeartHandshake
} from 'lucide-react';
import MealCategory from './MealCategory';
import { MealPlan } from '@/types';

interface MealPlanProps {
  mealPlan: MealPlan; // Using any here as we're importing the sample data
}

const MealPlanView: React.FC<MealPlanProps> = ({ mealPlan }) => {
  // Get meal categories 
  const { breakfast, lunch, dinner, snacks } = mealPlan.menu;
  
  // Translation map for goal types
  const goalTranslations = {
    'weight_loss': 'Похудение',
    'muscle_gain': 'Набор массы',
    'maintenance': 'Поддержание'
  };

  return (
    <div className="w-full">
      {/* Header with user info */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">План питания</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <HeartHandshake size={16} className="text-primary" />
            <span>Цель: {goalTranslations[mealPlan.goal as keyof typeof goalTranslations]}</span>
          </div>
          
          {mealPlan.preferences?.length > 0 && (
            <div className="flex items-center gap-1.5 ml-4">
              <Utensils size={16} className="text-primary" />
              <span>Предпочтения: {mealPlan.preferences?.join(', ')}</span>
            </div>
          )}
          
          {mealPlan.allergies?.length > 0 && (
            <div className="flex items-center gap-1.5 ml-4">
              <MessageCircleWarning size={16} className="text-primary" />
              <span>Исключения: {mealPlan.allergies?.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="all">Все блюда</TabsTrigger>
          <TabsTrigger value="breakfast">Завтрак</TabsTrigger>
          <TabsTrigger value="lunch">Обед</TabsTrigger>
          <TabsTrigger value="dinner">Ужин</TabsTrigger>
          <TabsTrigger value="snacks">Перекус</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-12">
            <div className="space-y-8">
              <MealCategory 
                title="Завтрак" 
                icon={<Coffee size={24} />} 
                meals={breakfast} 
                mealType="breakfast"
              />
              <MealCategory 
                title="Обед" 
                icon={<UtensilsCrossed size={24} />} 
                meals={lunch} 
                mealType="lunch"
              />
              <MealCategory 
                title="Ужин" 
                icon={<Moon size={24} />} 
                meals={dinner} 
                mealType="dinner"
              />
              <MealCategory 
                title="Перекус" 
                icon={<Apple size={24} />} 
                meals={snacks} 
                mealType="snacks"
              />
            </div>
        </TabsContent>
        
        <TabsContent value="breakfast">
          <MealCategory title="Завтрак" icon={<Coffee size={24} />} meals={breakfast} mealType="breakfast"/>
        </TabsContent>
        
        <TabsContent value="lunch">
          <MealCategory title="Обед" icon={<UtensilsCrossed size={24} />} meals={lunch} mealType="lunch"/>
        </TabsContent>
        
        <TabsContent value="dinner">
          <MealCategory title="Ужин" icon={<Moon size={24} />} meals={dinner} mealType="dinner"/>
        </TabsContent>
        
        <TabsContent value="snacks">
          <MealCategory title="Перекус" icon={<Apple size={24} />} meals={snacks} mealType="snacks"/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlanView; 