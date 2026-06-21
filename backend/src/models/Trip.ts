import { Schema, model, Document, Types } from 'mongoose';

export interface ITrip extends Document {
  user: Types.ObjectId;
  destination: string;
  days: number;
  budgetType: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: { day: number; activities: string[] }[];
  estimatedBudget?: number;
  budgetBreakdown?: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    totalEstimatedBudget: number;
  };
  hotels: { name: string; tier: string }[];
}

const TripSchema = new Schema<ITrip>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budgetType: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  interests: { type: [String], default: [] },
  itinerary: { type: Schema.Types.Mixed, default: [] },
  estimatedBudget: { type: Number },
  budgetBreakdown: {
    flights: Number,
    accommodation: Number,
    food: Number,
    activities: Number,
    totalEstimatedBudget: Number
  },
  hotels: [{ 
    name: String, 
    tier: String 
  }]
}, { timestamps: true });

export const Trip = model<ITrip>('Trip', TripSchema);     