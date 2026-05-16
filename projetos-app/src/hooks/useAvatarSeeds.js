// useAvatarSeeds.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateRandomSeed } from '../avatar/SeedEngine'

export function useAvatarSeeds(userId) {
  const [faceSeed,   setFaceSeed]   = useState(null)
  const [outfitSeed, setOutfitSeed] = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!userId) { 
        setLoading(false)
        return 
    }
    loadSeeds()
  }, [userId])

  async function loadSeeds() {
    setLoading(true)
    try {
        const { data, error } = await supabase
          .from('avatar_seeds')
          .select('face_seed, outfit_seed')
          .eq('user_id', userId)
          .maybeSingle()

        if (data) {
          setFaceSeed(data.face_seed)
          setOutfitSeed(data.outfit_seed)
        } else {
          // Novo usuário: seeds aleatórios
          const f = generateRandomSeed()
          const o = generateRandomSeed()
          setFaceSeed(f)
          setOutfitSeed(o)
          await saveSeeds(userId, f, o)
        }
    } catch (err) {
        console.error('Error loading avatar seeds:', err)
    } finally {
        setLoading(false)
    }
  }

  async function randomizeFace() {
    const newSeed = generateRandomSeed()
    setFaceSeed(newSeed)
    await saveSeeds(userId, newSeed, outfitSeed)
    return newSeed
  }

  async function randomizeOutfit() {
    const newSeed = generateRandomSeed()
    setOutfitSeed(newSeed)
    await saveSeeds(userId, faceSeed, newSeed)
    return newSeed
  }

  return { faceSeed, outfitSeed, loading, randomizeFace, randomizeOutfit }
}

async function saveSeeds(userId, faceSeed, outfitSeed) {
  try {
      const { error } = await supabase.from('avatar_seeds').upsert({
        user_id:    userId,
        face_seed:  faceSeed,
        outfit_seed: outfitSeed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      
      if (error) throw error
  } catch (err) {
      console.error('Error saving avatar seeds:', err)
  }
}
