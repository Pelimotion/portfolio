// avatarService.js
import { supabase } from '../lib/supabase'

export async function loadAvatarSeeds(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('avatar_seeds')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading avatar seeds:', error)
    return null
  }
  return data
}

export async function saveAvatarSeeds(userId, faceSeed, outfitSeed) {
  if (!userId) return false
  const { error } = await supabase
    .from('avatar_seeds')
    .upsert({
      user_id: userId,
      face_seed: faceSeed,
      outfit_seed: outfitSeed,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Error saving avatar seeds:', error)
    return false
  }
  return true
}
