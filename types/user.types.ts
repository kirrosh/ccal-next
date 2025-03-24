import { z } from 'zod';

// Базовые типы
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

// Интерфейс профиля пользователя
export interface UserProfile {
  id: string;
  gender: Gender;
  age: number;
  height: number; // в см
  weight: number; // в кг
  activityLevel: ActivityLevel;
  caloriesPerDay?: number; // Рассчитанная суточная норма калорий
}

// Константы для расчета калорий
export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Малоподвижный образ жизни
  light: 1.375, // Легкие упражнения 1-3 раза в неделю
  moderate: 1.55, // Умеренные упражнения 3-5 раз в неделю
  active: 1.725, // Интенсивные упражнения 6-7 раз в неделю
  very_active: 1.9, // Очень интенсивные упражнения или физическая работа
};

// Zod схема для профиля пользователя
export const userProfileSchema = z.object({
  id: z.string().optional(),
  gender: z.enum(['male', 'female']).describe('Пол пользователя'),
  age: z.number().min(1).max(120).describe('Возраст в годах'),
  height: z.number().min(50).max(250).describe('Рост в сантиметрах'),
  weight: z.number().min(20).max(300).describe('Вес в килограммах'),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .describe('Уровень физической активности'),
  caloriesPerDay: z.number().optional().describe('Рассчитанная суточная норма калорий'),
});
