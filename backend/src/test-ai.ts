import { generateItinerary } from './services/ai';
import dotenv from 'dotenv';

dotenv.config();

async function testAI() {
  console.log('🧪 Testing AI...');
  // console.log('HF_KEY exists:', !process.env.HF_API_KEY);
  console.log('HF_KEY exists:', !process.env.HF_API_KEY);
  
  try {
    const result = await generateItinerary({
      destination: 'Paris',
      days: 3,
      budgetType: 'Medium',
      interests: ['Food', 'Culture']
    });
    
    console.log('✅ Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

testAI();