import { z } from "zod";
import { mealPlanSchema } from '@/types';

// Схема для ингредиента
export const ingredient = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string()
});

// Схема для нутриентов
export const nutrients = z.object({
  calories: z.number(),
  protein: z.number(),
  fats: z.number(),
  carbs: z.number()
});

// Схема для одного блюда
export const meal = z.object({
  name: z.string(),
  dishType: z.enum(["homemade", "readymade"]),
  ingredients: z.array(ingredient),
  nutrients: nutrients,
  servingSize: z.number()
});

// Схема для плана питания
// export const mealPlan = z.object({
//   breakfasts: z.array(meal),
//   lunches: z.array(meal),
//   dinners: z.array(meal),
//   snacks: z.array(meal)
// });

// Нужно обязательно раскрывать все поля . Иначе не будет работать
export const mealPlan = z.object({
  userId: z.string().describe("ID пользователя"),
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance"]).describe("Цель питания (похудение, набор массы, поддержание)"),
  preferences: z.array(z.string()).describe("Предпочтения в еде"),
  allergies: z.array(z.string()).describe("Аллергены/исключения"),
  availableProducts: z.array(z.string()).describe("Продукты, которые уже есть в наличии"),
  currentDate: z.string().describe("Текущая дата для определения сезонных продуктов"),
  menu: z.object({
    breakfast: z.array(
      z.object({
        name: z.string().describe("Название завтрака на русском языке"),
        dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
        servingSize: z.number().describe("Размер готовой порции в граммах"),
        ingredients: z.array(
          z.object({
            name: z.string().describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
            amount: z.number().describe("Количество ингредиента"),
            unit: z.string().describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
          })
        ).describe("Ингредиенты завтрака в структурированном виде"),
        nutrients: z.object({
          calories: z.number().describe("Калории в блюде"),
          protein: z.number().describe("Белки в граммах"),
          fats: z.number().describe("Жиры в граммах"),
          carbs: z.number().describe("Углеводы в граммах"),
        }).describe("Нутриентный состав завтрака"),
      })
    ).length(5).describe("Список из 5 завтраков на неделю"),
    lunch: z.array(
      z.object({
        name: z.string().describe("Название обеда на русском языке"),
        dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
        servingSize: z.number().describe("Размер готовой порции в граммах"),
        ingredients: z.array(
          z.object({
            name: z.string().describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
            amount: z.number().describe("Количество ингредиента"),
            unit: z.string().describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
          })
        ).describe("Ингредиенты обеда в структурированном виде"),
        nutrients: z.object({
          calories: z.number().describe("Калории в блюде"),
          protein: z.number().describe("Белки в граммах"),
          fats: z.number().describe("Жиры в граммах"),
          carbs: z.number().describe("Углеводы в граммах"),
        }).describe("Нутриентный состав обеда"),
      })
    ).length(5).describe("Список из 5 обедов на неделю"),
    dinner: z.array(
      z.object({
        name: z.string().describe("Название ужина на русском языке"),
        dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
        servingSize: z.number().describe("Размер готовой порции в граммах"),
        ingredients: z.array(
          z.object({
            name: z.string().describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
            amount: z.number().describe("Количество ингредиента"),
            unit: z.string().describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
          })
        ).describe("Ингредиенты ужина в структурированном виде"),
        nutrients: z.object({
          calories: z.number().describe("Калории в блюде"),
          protein: z.number().describe("Белки в граммах"),
          fats: z.number().describe("Жиры в граммах"),
          carbs: z.number().describe("Углеводы в граммах"),
        }).describe("Нутриентный состав ужина"),
      })
    ).length(5).describe("Список из 5 ужинов на неделю"),
    snack: z.array(
      z.object({
        name: z.string().describe("Название перекуса на русском языке"),
        dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
        servingSize: z.number().describe("Размер готовой порции в граммах"),
        ingredients: z.array(
          z.object({
            name: z.string().describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
            amount: z.number().describe("Количество ингредиента"),
            unit: z.string().describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
          })
        ).describe("Ингредиенты перекуса в структурированном виде"),
        nutrients: z.object({
          calories: z.number().describe("Калории в блюде"),
          protein: z.number().describe("Белки в граммах"),
          fats: z.number().describe("Жиры в граммах"),
          carbs: z.number().describe("Углеводы в граммах"),
        }).describe("Нутриентный состав перекуса"),
      })
    ).length(5).describe("Список из 5 перекусов на неделю"),
  }).describe("Меню на неделю"),
});

export { mealPlanSchema };
export type MealPlan = z.infer<typeof mealPlanSchema>;