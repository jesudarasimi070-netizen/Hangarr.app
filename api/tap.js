import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { profileId, pointsToAdd } = req.body;
  if (!profileId || !pointsToAdd || pointsToAdd > 500) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', profileId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const newScore = Number(profile.points) + Number(pointsToAdd);
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ points: newScore })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, points: updated.points });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
         }
    
