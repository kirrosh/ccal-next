import mongoose from 'mongoose';

const targetDailyCaloriesSchema = new mongoose.Schema({
  breakfastMin: { type: Number, required: true },
  breakfastMax: { type: Number, required: true },
  lunchMin: { type: Number, required: true },
  lunchMax: { type: Number, required: true },
  dinnerMin: { type: Number, required: true },
  dinnerMax: { type: Number, required: true },
  snacksMin: { type: Number, required: true },
  snacksMax: { type: Number, required: true },
});

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
  },
  height: {
    type: Number,
    required: true,
    min: 50,
    max: 250,
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 300,
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    required: true,
  },
  daily_calories: {
    type: Number,
    required: false,
  },
  target_daily_calories: {
    type: targetDailyCaloriesSchema,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema); 