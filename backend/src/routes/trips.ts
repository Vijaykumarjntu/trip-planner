import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Trip } from '../models/Trip';
import { generateItinerary, regenerateDay } from '../services/ai';

const router = express.Router();

// Public generate endpoint — returns generated itinerary, budget, and hotels without saving.
// router.post('/generate', async (req, res) => {
//   const { destination, days, budgetType, interests } = req.body;
//   if (!destination || !days || !budgetType) return res.status(400).json({ message: 'Missing fields' });
//   try {   
//     const result = await generateItinerary({ destination, days, budgetType, interests });
//     return res.json(result);
//   } catch (err) {
//     console.error('Generate failed', err);
//     return res.status(500).json({ message: 'Generation failed' });
//   }
// });

// // Protected routes require authentication
// router.use(requireAuth);

// // Create and save a trip, generating itinerary and budget on save
// router.post('/', async (req: AuthRequest, res) => {
//   const { destination, days, budgetType, interests } = req.body;
//   try {
//     const generated = await generateItinerary({ destination, days, budgetType, interests });
//     const est = generated?.budgetBreakdown?.totalEstimatedBudget || undefined;
//     const trip = new Trip({ user: req.userId, destination, days, budgetType, interests, itinerary: generated.itinerary, estimatedBudget: est });
//     await trip.save();
//     return res.json({ trip, generated });
//   } catch (err) {
//     console.error('Failed to create trip', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });


// ... existing code ...

// Public generate endpoint - uses real AI
router.post('/generate', async (req, res) => {
  const { destination, days, budgetType, interests } = req.body;
  if (!destination || !days || !budgetType) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    console.log('🚀 Generating public trip for:', destination);
    const result = await generateItinerary({ 
      destination, 
      days, 
      budgetType, 
      interests: interests || [] 
    });
    return res.json(result);
  } catch (err) {
    console.error('Generate failed', err);
    return res.status(500).json({ message: 'Generation failed' });
  }
});

  // Create and save a trip - uses real AI
  router.post('/',requireAuth,   async (req: AuthRequest, res) => {
    const { destination, days, budgetType, interests } = req.body;
    try {
      console.log('🚀 Generating trip for user:', req.userId, 'destination:', destination);
      console.log("this is the request body");
      // console.log(req.body);
      // console.log(req); 
      const generated = await generateItinerary({ 
        destination, 
        days, 
        budgetType, 
        interests: interests || [] 
      });
      
      const est = generated?.budgetBreakdown?.totalEstimatedBudget || 0;
      const trip = new Trip({ 
        user: req.userId, 
        destination, 
        days, 
        budgetType, 
        interests: interests || [], 
        itinerary: generated.itinerary,
        estimatedBudget: est,
        budgetBreakdown: generated.budgetBreakdown,
        hotels: generated.hotels
      });
      await trip.save();
      return res.json({ trip, generated });
    } catch (err) {
      console.error('Failed to create trip', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

// ... rest of routes ...
router.get('/', async (req: AuthRequest, res) => {
  try {
    const trips = await Trip.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json(trips);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a single trip (owner only)
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    return res.json(trip);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate a specific day for a saved trip
router.patch('/:id/day/:day/regenerate', async (req: AuthRequest, res) => {
  const { id, day } = req.params;
  const { focus } = req.body;
  try {
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    const dayNum = Number(day);
    const regenerated = await regenerateDay({ destination: trip.destination, days: trip.days, budgetType: trip.budgetType as any, interests: trip.interests, day: dayNum, focus });
    // replace the day's activities
    trip.itinerary = trip.itinerary || [];
    trip.itinerary[dayNum - 1] = regenerated;
    await trip.save();
    return res.json({ trip });
  } catch (err) {
    console.error('Regenerate failed', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add activity to a day
router.post('/:id/activity', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { day, activity } = req.body;
  if (!day || !activity) return res.status(400).json({ message: 'Missing fields' });
  try {
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    trip.itinerary = trip.itinerary || [];
    const idx = day - 1;
    trip.itinerary[idx] = trip.itinerary[idx] || { day, activities: [] };
    trip.itinerary[idx].activities.push(activity);
    await trip.save();
    return res.json({ trip });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove activity from a day by index
router.delete('/:id/activity', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { day, index } = req.body;
  if (!day || index === undefined) return res.status(400).json({ message: 'Missing fields' });
  try {
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    trip.itinerary = trip.itinerary || [];
    const idx = day - 1;
    if (!trip.itinerary[idx]) return res.status(400).json({ message: 'Day not found' });
    trip.itinerary[idx].activities.splice(index, 1);
    await trip.save();
    return res.json({ trip });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a trip (owner only)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    await Trip.deleteOne({ _id: trip._id });
    return res.json({ message: 'Trip deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Suggest hotels for a saved trip
router.get('/:id/hotels', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    const generated = await generateItinerary({ destination: trip.destination, days: trip.days, budgetType: trip.budgetType as any, interests: trip.interests });
    return res.json({ hotels: generated.hotels });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
