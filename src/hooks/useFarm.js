import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useFarm() {
  const { user } = useAuth()
  const [farm, setFarm]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchFarm()
  }, [user])

  async function fetchFarm() {
    setLoading(true)
    const { data } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single()
    setFarm(data)
    setLoading(false)
  }

  async function createFarm(name, location = '', grapeType = '') {
    const { data, error } = await supabase
      .from('farms')
      .insert({ user_id: user.id, name, location, grape_type: grapeType })
      .select()
      .single()
    if (!error) setFarm(data)
    return { data, error }
  }

  return { farm, loading, createFarm, refetch: fetchFarm }
}

