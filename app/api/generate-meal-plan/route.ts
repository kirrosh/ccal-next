import { chain } from '@/lchain';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      people_count, 
      goal, 
      preferences, 
      allergies, 
      region, 
      available_products 
    } = body;

    const mealPlan = await chain.invoke({
      people_count,
      goal,
      preferences,
      allergies,
      region,
      current_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      available_products
    });

    const mealPlanWithId = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...mealPlan
    };

    return NextResponse.json(mealPlanWithId);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
} 