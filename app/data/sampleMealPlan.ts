// Sample meal plan data based on the schema
const sampleMealPlan = {
  userId: "user123",
  peopleCount: 2,
  goal: "weight_loss",
  preferences: ["Средиземноморская кухня", "Низкокалорийные блюда"],
  allergies: ["Орехи", "Лактоза"],
  availableProducts: ["Куриное филе", "Овощи", "Рис", "Гречка"],
  currentDate: "2024-03-21",
  menu: {
    breakfast: [
      {
        name: "Овсянка с ягодами",
        dishType: "homemade",
        ingredients: [
          { name: "Овсяные хлопья", amount: 50, unit: "г" },
          { name: "Ягоды (замороженные)", amount: 30, unit: "г" },
          { name: "Мед", amount: 5, unit: "г" },
        ],
        nutrients: {
          calories: 220,
          protein: 6,
          fats: 3,
          carbs: 42,
        },
      },
      {
        name: "Яичница с овощами",
        dishType: "homemade",
        ingredients: [
          { name: "Яйца", amount: 2, unit: "шт" },
          { name: "Помидоры", amount: 50, unit: "г" },
          { name: "Шпинат", amount: 20, unit: "г" },
        ],
        nutrients: {
          calories: 180,
          protein: 14,
          fats: 12,
          carbs: 3,
        },
      },
      {
        name: "Творожная запеканка",
        dishType: "homemade",
        ingredients: [
          { name: "Творог 2%", amount: 150, unit: "г" },
          { name: "Яйцо", amount: 1, unit: "шт" },
          { name: "Мед", amount: 10, unit: "г" },
        ],
        nutrients: {
          calories: 250,
          protein: 24,
          fats: 8,
          carbs: 15,
        },
      },
    ],
    lunch: [
      {
        name: "Куриный суп с овощами",
        dishType: "homemade",
        ingredients: [
          { name: "Куриное филе", amount: 100, unit: "г" },
          { name: "Морковь", amount: 50, unit: "г" },
          { name: "Лук", amount: 30, unit: "г" },
          { name: "Сельдерей", amount: 20, unit: "г" },
        ],
        nutrients: {
          calories: 190,
          protein: 25,
          fats: 4,
          carbs: 12,
        },
      },
      {
        name: "Греческий салат",
        dishType: "homemade",
        ingredients: [
          { name: "Огурцы", amount: 80, unit: "г" },
          { name: "Помидоры", amount: 80, unit: "г" },
          { name: "Оливки", amount: 20, unit: "г" },
          { name: "Сыр фета", amount: 40, unit: "г" },
          { name: "Оливковое масло", amount: 10, unit: "мл" },
        ],
        nutrients: {
          calories: 180,
          protein: 7,
          fats: 14,
          carbs: 6,
        },
      },
      {
        name: "Рис с овощами",
        dishType: "homemade",
        ingredients: [
          { name: "Рис бурый", amount: 70, unit: "г" },
          { name: "Брокколи", amount: 80, unit: "г" },
          { name: "Морковь", amount: 50, unit: "г" },
          { name: "Соевый соус", amount: 10, unit: "мл" },
        ],
        nutrients: {
          calories: 230,
          protein: 5,
          fats: 2,
          carbs: 48,
        },
      },
      {
        name: "Куриная грудка с гречкой",
        dishType: "homemade",
        ingredients: [
          { name: "Куриная грудка", amount: 120, unit: "г" },
          { name: "Гречка", amount: 70, unit: "г" },
          { name: "Чеснок", amount: 5, unit: "г" },
          { name: "Оливковое масло", amount: 5, unit: "мл" },
        ],
        nutrients: {
          calories: 320,
          protein: 28,
          fats: 7,
          carbs: 32,
        },
      },
    ],
    dinner: [
      {
        name: "Запеченная рыба с овощами",
        dishType: "homemade",
        ingredients: [
          { name: "Филе трески", amount: 150, unit: "г" },
          { name: "Кабачки", amount: 100, unit: "г" },
          { name: "Болгарский перец", amount: 70, unit: "г" },
          { name: "Лимон", amount: 10, unit: "г" },
        ],
        nutrients: {
          calories: 200,
          protein: 30,
          fats: 4,
          carbs: 10,
        },
      },
      {
        name: "Тушеная индейка с овощами",
        dishType: "homemade",
        ingredients: [
          { name: "Филе индейки", amount: 120, unit: "г" },
          { name: "Цукини", amount: 80, unit: "г" },
          { name: "Баклажан", amount: 70, unit: "г" },
          { name: "Томаты", amount: 50, unit: "г" },
        ],
        nutrients: {
          calories: 210,
          protein: 28,
          fats: 5,
          carbs: 12,
        },
      },
      {
        name: "Овощная фриттата",
        dishType: "homemade",
        ingredients: [
          { name: "Яйца", amount: 3, unit: "шт" },
          { name: "Шпинат", amount: 50, unit: "г" },
          { name: "Грибы", amount: 50, unit: "г" },
          { name: "Томаты черри", amount: 40, unit: "г" },
        ],
        nutrients: {
          calories: 240,
          protein: 20,
          fats: 16,
          carbs: 5,
        },
      },
      {
        name: "Котлеты из индейки с пюре",
        dishType: "homemade",
        ingredients: [
          { name: "Фарш из индейки", amount: 120, unit: "г" },
          { name: "Цветная капуста", amount: 150, unit: "г" },
          { name: "Лук", amount: 20, unit: "г" },
          { name: "Яйцо", amount: 0.5, unit: "шт" },
        ],
        nutrients: {
          calories: 230,
          protein: 25,
          fats: 9,
          carbs: 14,
        },
      },
    ],
    snack: [
      {
        name: "Йогурт с фруктами",
        dishType: "readymade",
        ingredients: [
          { name: "Натуральный йогурт", amount: 150, unit: "г" },
          { name: "Яблоко", amount: 1, unit: "шт" },
        ],
        nutrients: {
          calories: 120,
          protein: 8,
          fats: 2,
          carbs: 18,
        },
      },
      {
        name: "Творог с ягодами",
        dishType: "homemade",
        ingredients: [
          { name: "Творог 0%", amount: 100, unit: "г" },
          { name: "Ягоды", amount: 50, unit: "г" },
        ],
        nutrients: {
          calories: 110,
          protein: 18,
          fats: 0.5,
          carbs: 10,
        },
      },
      {
        name: "Смузи с шпинатом",
        dishType: "homemade",
        ingredients: [
          { name: "Шпинат", amount: 30, unit: "г" },
          { name: "Банан", amount: 0.5, unit: "шт" },
          { name: "Яблоко", amount: 0.5, unit: "шт" },
          { name: "Вода", amount: 150, unit: "мл" },
        ],
        nutrients: {
          calories: 90,
          protein: 2,
          fats: 0.5,
          carbs: 20,
        },
      },
    ],
  },
};

export default sampleMealPlan; 