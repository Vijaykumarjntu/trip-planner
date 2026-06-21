type GenerateInput = {
  destination: string;
  days: number;
  budgetType: 'Low' | 'Medium' | 'High';
  interests?: string[];
}

type ItineraryResponse = {
  itinerary: { day: number; activities: string[] }[];
  budgetBreakdown: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    totalEstimatedBudget: number;
  };
  hotels: { name: string; tier: string }[];
}

// ============== STUB DATA (FALLBACK) ==============

function generateItineraryStub(input: GenerateInput): ItineraryResponse {
  const { destination, days, budgetType, interests = [] } = input;
  const interestMap: Record<string, string[]> = {
    Food: ['Try local street food', 'Visit a popular market', 'Take a cooking class'],
    Culture: ['Visit the main temple', 'Local museum visit', 'Historical walking tour'],
    Adventure: ['Hiking excursion', 'Water sports session', 'Bike rental and explore'],
    Shopping: ['Visit district shopping streets', 'Local handicraft market', 'Outlet mall visit'],
    Relaxation: ['Spa day', 'Park picnic', 'Sunset viewpoint']
  };

  const fallback = ['Explore downtown highlights', 'Take a photo tour', 'Join a city walking tour'];

  const itinerary = Array.from({ length: days }).map((_, i) => {
    const dayNum = i + 1;
    const activities: string[] = [];
    const chosenInterests = interests.length ? interests : ['Culture'];
    for (let j = 0; j < 2; j++) {
      const int = chosenInterests[(i + j) % chosenInterests.length];
      const pool = interestMap[int] || fallback;
      activities.push(pool[(i + j) % pool.length]);
    }
    if (Math.random() > 0.6) activities.push(fallback[(i + 1) % fallback.length]);
    return { day: dayNum, activities };
  });

  const flightBase = 400;
  const accPerNight = budgetType === 'Low' ? 50 : budgetType === 'Medium' ? 120 : 250;
  const foodPerDay = budgetType === 'Low' ? 20 : budgetType === 'Medium' ? 45 : 90;
  const activitiesPerDay = budgetType === 'Low' ? 20 : budgetType === 'Medium' ? 50 : 120;

  const accommodation = accPerNight * days;
  const food = foodPerDay * days;
  const activitiesCost = activitiesPerDay * days;
  const flights = flightBase;
  const total = flights + accommodation + food + activitiesCost;

  const budgetBreakdown = {
    flights,
    accommodation,
    food,
    activities: activitiesCost,
    totalEstimatedBudget: Math.round(total)
  };

  const hotels = ((): { name: string; tier: string }[] => {
    if (budgetType === 'Low') return [
      { name: `Budget Inn ${destination}`, tier: 'Budget Friendly' },
      { name: `Hostel Central ${destination}`, tier: 'Budget Friendly' }
    ];
    if (budgetType === 'Medium') return [
      { name: `Comfort ${destination} Hotel`, tier: 'Mid Range' },
      { name: `City Stay ${destination}`, tier: 'Mid Range' }
    ];
    return [
      { name: `${destination} Grand Hotel`, tier: 'Luxury' },
      { name: `Imperial ${destination} Resort`, tier: 'Luxury' }
    ];
  })();

  return { itinerary, budgetBreakdown, hotels };
}

// ============== HUGGING FACE API CALL ==============

// async function callHuggingFaceModel(prompt: string): Promise<string> {
//   const HF_KEY = process.env.HF_API_KEY || process.env.hf_api_key;
//   const HF_MODEL = process.env.HF_MODEL || 'tiiuae/falcon-7b-instruct';
  
//   if (!HF_KEY) {
//     console.warn('⚠️ No Hugging Face API key found. Using stub data.');
//     throw new Error('No HF_API_KEY found');
//   }

//   // const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
//   // const url = https://router.huggingface.co/v1/chat/completions
  
//   // console.log(`🤖 Calling Hugging Face API with model: ${HF_MODEL}`);
  
//   // try {
//   //   const response = await fetch(url, {
//   //     method: 'POST',
//   //     headers: {
//   //       'Authorization': `Bearer ${HF_KEY}`,
//   //       'Content-Type': 'application/json',
//   //     },
//   //     body: JSON.stringify({
//   //       inputs: prompt,
//   //       parameters: {
//   //         max_new_tokens: 1000,
//   //         temperature: 0.7,
//   //         top_p: 0.95,
//   //         do_sample: true,
//   //         return_full_text: false
//   //       },
//   //       options: {
//   //         wait_for_model: true,
//   //         use_cache: true
//   //       }
//   //     })
//   //   });
//     // 1. Update the URL to the unified gateway (remove the old model-specific URL)
// const url = 'https://router.huggingface.co/v1/chat/completions';

// console.log(`🤖 Calling Hugging Face API with model: ${HF_MODEL}`);

// try {
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${HF_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     // 2. Pass your model name right here inside the body object!
//     body: JSON.stringify({
//       model: HF_MODEL, // <--- This is where your 'tiiuae/falcon-7b-instruct' goes
//       messages: [
//         { role: 'user', content: prompt }
//       ],
//       max_tokens: 1000,
//       temperature: 0.7,
//     })
//   });

//   // ... rest of your code
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ HF API Error:', response.status, errorText);
      
//       if (response.status === 503) {
//         throw new Error('Model is loading, please wait a few seconds and try again');
//       }
      
//       throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     console.log(data);
//     console.log('✅ HF API Response received');
    
//     // Extract generated text
//     let generatedText = '';
//     if (Array.isArray(data) && data.length > 0) {
//       generatedText = data[0]?.generated_text || '';
//     } else if (data.generated_text) {
//       generatedText = data.generated_text;
//     } else if (typeof data === 'string') {
//       generatedText = data;
//     } else {
//       generatedText = JSON.stringify(data);
//     }
    
//     return generatedText;
//   } catch (error) {
//     console.error('❌ Hugging Face API call failed:', error);
//     throw error;
//   }
// }


async function callHuggingFaceModel(prompt: string): Promise<string> {
  const HF_KEY = process.env.HF_API_KEY || process.env.hf_api_key;
  const HF_MODEL = process.env.HF_MODEL || 'tiiuae/falcon-7b-instruct';
  
  if (!HF_KEY) {
    console.warn('⚠️ No Hugging Face API key found. Using stub data.');
    throw new Error('No HF_API_KEY found');
  }

  // ✅ Using Chat Completions endpoint
  const url = 'https://router.huggingface.co/v1/chat/completions';

  console.log(`🤖 Calling Hugging Face API with model: ${HF_MODEL}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a travel planning expert. Return valid JSON only. Do not include markdown formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HF API Error:', response.status, errorText);
      
      if (response.status === 503) {
        throw new Error('Model is loading, please wait a few seconds and try again');
      }
      
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Raw API Response:', JSON.stringify(data, null, 2));
    console.log('✅ HF API Response received');

    // ✅ FIX: Parse the Chat Completions format
    let generatedText = '';
    
    // Check if it's the Chat Completions format
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        generatedText = choice.message.content;
        console.log('📝 Extracted from choices[0].message.content');
      } else if (choice.text) {
        generatedText = choice.text;
        console.log('📝 Extracted from choices[0].text');
      } else if (choice.generated_text) {
        generatedText = choice.generated_text;
        console.log('📝 Extracted from choices[0].generated_text');
      }
    } 
    // Fallback: Check if it's the old Inference API format
    else if (Array.isArray(data) && data.length > 0) {
      if (data[0]?.generated_text) {
        generatedText = data[0].generated_text;
        console.log('📝 Extracted from array[0].generated_text');
      }
    } 
    // Check for direct generated_text
    else if (data.generated_text) {
      generatedText = data.generated_text;
      console.log('📝 Extracted from data.generated_text');
    }
    // If all else fails, stringify the whole response
    else {
      console.warn('⚠️ Unknown response format, stringifying entire response');
      generatedText = JSON.stringify(data);
    }

    // ✅ Log a preview of what we got
    console.log('📝 Generated text preview:', generatedText.substring(0, 200) + '...');
    
    return generatedText;

  } catch (error) {
    console.error('❌ Hugging Face API call failed:', error);
    throw error;
  }
}
// ============== PROMPT BUILDERS FOR FALCON ==============

function buildItineraryPrompt(input: GenerateInput): string {
  const { destination, days, budgetType, interests = [] } = input;
  const interestsStr = interests.length ? interests.join(', ') : 'General travel';
  
  // Falcon-7B-Instruct works best with clear instructions
  return `You are a travel planning assistant. Generate a complete travel itinerary in JSON format.

Trip Details:
- Destination: ${destination}
- Duration: ${days} days
- Budget: ${budgetType} (Low = budget-friendly, Medium = moderate, High = luxury)
- Interests: ${interestsStr}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "itinerary": [
    {
      "day": 1,
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ],
  "budgetBreakdown": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "totalEstimatedBudget": 950
  },
  "hotels": [
    {
      "name": "Hotel Name",
      "tier": "Budget Friendly/Mid Range/Luxury"
    }
  ]
}

Make activities specific to ${destination}, realistic for ${budgetType} budget, and include 2-4 activities per day.

JSON:`;
}

function buildRegeneratePrompt(
  destination: string, 
  day: number, 
  focus: string = '', 
  interests: string[] = []
): string {
  const interestsStr = interests.length ? interests.join(', ') : 'General travel';
  const focusStr = focus ? ` with focus on ${focus}` : '';
  
  return `Generate 3-4 activities for Day ${day} of a trip to ${destination}${focusStr}.
Interests: ${interestsStr}.

Return ONLY a valid JSON object:
{
  "day": ${day},
  "activities": ["Activity 1", "Activity 2", "Activity 3"]
}

Make activities specific to ${destination}.

JSON:`;
}

// ============== PARSE AI RESPONSE ==============

function parseAIResponse(text: string, fallback: any): any {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('❌ Failed to parse AI response:', error);
    console.log('Response was:', text.substring(0, 200));
    return fallback;
  }
}

// ============== MAIN EXPORTED FUNCTIONS ==============

export async function generateItinerary(input: GenerateInput): Promise<ItineraryResponse> {
  // Check if we have HF API key
  if (!process.env.HF_API_KEY) {
    console.log('📝 Using stub data (no HF API key)');
    return generateItineraryStub(input);
  }

  try {
    console.log(`🌍 Generating itinerary for ${input.destination} (${input.days} days)`);
    
    const prompt = buildItineraryPrompt(input);
    const response = await callHuggingFaceModel(prompt);
    
    // Parse the response
    const parsed = parseAIResponse(response, generateItineraryStub(input));
    console.log('Parsed AI response:', parsed);
    // Validate the response structure
    if (!parsed.itinerary || !parsed.budgetBreakdown || !parsed.hotels) {
      console.warn('⚠️ Invalid response structure, using stub');
      return generateItineraryStub(input);
    }
    
    // Ensure itinerary has correct structure
    const itinerary = parsed.itinerary.map((day: any) => ({
      day: day.day || 1,
      activities: day.activities || ['Explore the city']
    }));
    
    // Ensure budget breakdown has all fields
    const budgetBreakdown = {
      flights: parsed.budgetBreakdown.flights || 400,
      accommodation: parsed.budgetBreakdown.accommodation || 300,
      food: parsed.budgetBreakdown.food || 150,
      activities: parsed.budgetBreakdown.activities || 100,
      totalEstimatedBudget: parsed.budgetBreakdown.totalEstimatedBudget || 950
    };
    
    // Ensure hotels have correct structure
    const hotels = parsed.hotels.map((hotel: any) => ({
      name: hotel.name || 'City Hotel',
      tier: hotel.tier || 'Mid Range'
    }));
    
    console.log('✅ AI generation successful!');
    
    return {
      itinerary,
      budgetBreakdown,
      hotels
    };
  } catch (error) {
    console.error('❌ AI generation failed, using stub:', error);
    return generateItineraryStub(input);
  }
}

export async function regenerateDay(input: GenerateInput & { day: number; focus?: string }) {
  const { destination, day, focus = '', interests = [] } = input;
  
  // Check if we have HF API key
  if (!process.env.HF_API_KEY && !process.env.hf_api_key) {
    console.log('📝 Using stub data for regeneration (no HF API key)');
    return regenerateDayStub(input);
  }

  try {
    console.log(`🔄 Regenerating day ${day} for ${destination}`);
    
    const prompt = buildRegeneratePrompt(destination, day, focus, interests);
    const response = await callHuggingFaceModel(prompt);
    
    // Parse the response
    const parsed = parseAIResponse(response, { day, activities: [`Explore ${destination} - Day ${day}`] });
    
    // Ensure activities is an array
    const activities = Array.isArray(parsed.activities) 
      ? parsed.activities 
      : [`Explore ${destination}`];
    
    console.log(`✅ Day ${day} regenerated successfully!`);
    
    return {
      day,
      activities: activities.slice(0, 4) // Limit to 4 activities
    };
  } catch (error) {
    console.error('❌ Regeneration failed, using stub:', error);
    return regenerateDayStub(input);
  }
}

// Stub for regeneration (fallback)
function regenerateDayStub(input: GenerateInput & { day: number; focus?: string }) {
  const { destination, day, focus, interests = [] } = input;
  const activities: string[] = [];
  
  if (focus && focus.toLowerCase().includes('outdoor')) {
    activities.push(`Outdoor hike near ${destination}`);
    activities.push(`Picnic at popular park`);
  } else if (focus && focus.toLowerCase().includes('food')) {
    activities.push(`Food tour in ${destination}`);
    activities.push(`Visit local restaurants`);
  } else if (focus && focus.toLowerCase().includes('culture')) {
    activities.push(`Museum visit in ${destination}`);
    activities.push(`Historical sites tour`);
  } else {
    activities.push(`Explore local market in ${destination}`);
    activities.push(`Visit iconic landmark for day ${day}`);
  }
  
  if (interests.length) {
    activities.push(`Enjoy ${interests[0]} highlights`);
  }
  
  return { day, activities };
} 