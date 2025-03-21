import { z } from "zod";

// Полностью инлайновое определение схемы без переиспользования типов. Нужно чтобы раьботала нейронка от гугла в langchain
const mealPlan = z.object({
    userId: z.string().describe("ID пользователя"),
    peopleCount: z.number().min(1).describe("Количество человек"),
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
      ).min(3).describe("Список из минимум 3 завтраков на неделю"),
      lunch: z.array(
        z.object({
          name: z.string().describe("Название обеда на русском языке"),
          dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
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
      ).min(4).describe("Список из минимум 4 обедов на неделю"),
      dinner: z.array(
        z.object({
          name: z.string().describe("Название ужина на русском языке"),
          dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
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
      ).min(4).describe("Список из минимум 4 ужинов на неделю"),
      snack: z.array(
        z.object({
          name: z.string().describe("Название перекуса на русском языке"),
          dishType: z.enum(["homemade", "readymade"]).describe("Тип блюда: приготовленное дома или готовое из кафе/кулинарии"),
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
      ).min(3).describe("Список из минимум 3 перекусов на неделю"),
    }).describe("Меню на неделю"),
  });
  
  export { mealPlan };