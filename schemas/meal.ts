import { z } from 'zod';

const nutrientsSchema = z.object({
  calories: z.number().describe('Калории в блюде'),
  protein: z.number().describe('Белки в граммах'),
  fats: z.number().describe('Жиры в граммах'),
  carbs: z.number().describe('Углеводы в граммах'),
});

const ingredientSchema = z.object({
  name: z.string().describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
  amount: z.number().describe('Количество ингредиента'),
  unit: z.string().describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
});

export const mealSchema = z.object({
  name: z.string().describe('Название блюда на русском языке'),
  dishType: z
    .enum(['homemade', 'readymade'])
    .describe('Тип блюда: приготовленное дома или готовое из кафе/кулинарии'),
  servingSize: z.number().describe('Размер готовой порции в граммах'),
  ingredients: z.array(ingredientSchema).describe('Ингредиенты в структурированном виде'),
  nutrients: nutrientsSchema.describe('Нутриентный состав блюда'),
});

export const mealPlanSchema = z.object({
  name: z.string().describe('Название рациона питания'),
  goal: z
    .enum(['weight_loss', 'muscle_gain', 'maintenance'])
    .describe('Цель питания (похудение, набор массы, поддержание)'),
  preferences: z.array(z.string()).describe('Предпочтения в еде'),
  allergies: z.array(z.string()).describe('Аллергены/исключения'),
  availableProducts: z.array(z.string()).describe('Продукты, которые уже есть в наличии'),
  currentDate: z.string().describe('Текущая дата для определения сезонных продуктов'),
  createdAt: z.string().describe('Дата создания плана питания'),
  menu: z
    .object({
      breakfast: z.array(mealSchema).length(5).describe('Список из 5 завтраков на неделю'),
      lunch: z.array(mealSchema).length(5).describe('Список из 5 обедов на неделю'),
      dinner: z.array(mealSchema).length(5).describe('Список из 5 ужинов на неделю'),
      snacks: z.array(mealSchema).length(5).describe('Список из 5 перекусов на неделю'),
    })
    .describe('Меню на неделю'),
});

export const mealPlanSchemaInline = z.object({
  name: z.string().describe('Название рациона питания'),
  goal: z
    .enum(['weight_loss', 'muscle_gain', 'maintenance'])
    .describe('Цель питания (похудение, набор массы, поддержание)'),
  preferences: z.array(z.string()).describe('Предпочтения в еде'),
  allergies: z.array(z.string()).describe('Аллергены/исключения'),
  availableProducts: z.array(z.string()).describe('Продукты, которые уже есть в наличии'),
  currentDate: z.string().describe('Текущая дата для определения сезонных продуктов'),
  createdAt: z.string().describe('Дата создания плана питания'),
  menu: z
    .object({
      breakfast: z
        .array(
          z.object({
            name: z.string().describe('Название блюда на русском языке'),
            dishType: z
              .enum(['homemade', 'readymade'])
              .describe('Тип блюда: приготовленное дома или готовое из кафе/кулинарии'),
            servingSize: z.number().describe('Размер готовой порции в граммах'),
            ingredients: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
                  amount: z.number().describe('Количество ингредиента'),
                  unit: z
                    .string()
                    .describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
                })
              )
              .describe('Ингредиенты в структурированном виде'),
            nutrients: z
              .object({
                calories: z.number().describe('Калории в блюде'),
                protein: z.number().describe('Белки в граммах'),
                fats: z.number().describe('Жиры в граммах'),
                carbs: z.number().describe('Углеводы в граммах'),
              })
              .describe('Нутриентный состав блюда'),
          })
        )
        .length(5)
        .describe('Список из 5 завтраков на неделю'),
      lunch: z
        .array(
          z.object({
            name: z.string().describe('Название блюда на русском языке'),
            dishType: z
              .enum(['homemade', 'readymade'])
              .describe('Тип блюда: приготовленное дома или готовое из кафе/кулинарии'),
            servingSize: z.number().describe('Размер готовой порции в граммах'),
            ingredients: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
                  amount: z.number().describe('Количество ингредиента'),
                  unit: z
                    .string()
                    .describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
                })
              )
              .describe('Ингредиенты в структурированном виде'),
            nutrients: z
              .object({
                calories: z.number().describe('Калории в блюде'),
                protein: z.number().describe('Белки в граммах'),
                fats: z.number().describe('Жиры в граммах'),
                carbs: z.number().describe('Углеводы в граммах'),
              })
              .describe('Нутриентный состав блюда'),
          })
        )
        .length(5)
        .describe('Список из 5 обедов на неделю'),
      dinner: z
        .array(
          z.object({
            name: z.string().describe('Название блюда на русском языке'),
            dishType: z
              .enum(['homemade', 'readymade'])
              .describe('Тип блюда: приготовленное дома или готовое из кафе/кулинарии'),
            servingSize: z.number().describe('Размер готовой порции в граммах'),
            ingredients: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
                  amount: z.number().describe('Количество ингредиента'),
                  unit: z
                    .string()
                    .describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
                })
              )
              .describe('Ингредиенты в структурированном виде'),
            nutrients: z
              .object({
                calories: z.number().describe('Калории в блюде'),
                protein: z.number().describe('Белки в граммах'),
                fats: z.number().describe('Жиры в граммах'),
                carbs: z.number().describe('Углеводы в граммах'),
              })
              .describe('Нутриентный состав блюда'),
          })
        )
        .length(5)
        .describe('Список из 5 ужинов на неделю'),
      snacks: z
        .array(
          z.object({
            name: z.string().describe('Название блюда на русском языке'),
            dishType: z
              .enum(['homemade', 'readymade'])
              .describe('Тип блюда: приготовленное дома или готовое из кафе/кулинарии'),
            servingSize: z.number().describe('Размер готовой порции в граммах'),
            ingredients: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe("Название ингредиента (например, 'куриное филе', 'овсяные хлопья')"),
                  amount: z.number().describe('Количество ингредиента'),
                  unit: z
                    .string()
                    .describe("Единица измерения (например, 'г', 'мл', 'шт', 'ст.л.')"),
                })
              )
              .describe('Ингредиенты в структурированном виде'),
            nutrients: z
              .object({
                calories: z.number().describe('Калории в блюде'),
                protein: z.number().describe('Белки в граммах'),
                fats: z.number().describe('Жиры в граммах'),
                carbs: z.number().describe('Углеводы в граммах'),
              })
              .describe('Нутриентный состав блюда'),
          })
        )
        .length(5)
        .describe('Список из 5 перекусов на неделю'),
    })
    .describe('Меню на неделю'),
});

export type MealPlan = z.infer<typeof mealPlanSchema> & { id: string; userId: string };
export type MealPlanInline = z.infer<typeof mealPlanSchemaInline> & { id: string; userId: string };
