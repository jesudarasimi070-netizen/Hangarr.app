import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { handle, name } = req.body;
  if (!handle || !name) return res.status(400).json({ error: 'Handle and name required' });

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;

  try {
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', cleanHandle)
      .single();

    if (!profile) {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{ handle: cleanHandle, name, points: 1000 }])
        .select()
        .single();
      if (error) throw error;
      profile = newProfile;
    }

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
