import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAlerts(farmId) {
  const [alerts, setAlerts]       = useState([])
  const [unreadCount, setUnread]  = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!farmId) return
    fetchAlerts()

    const channel = supabase
      .channel('alerts_live')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'alerts',
        filter: `farm_id=eq.${farmId}`,
      }, payload => {
        setAlerts(prev => [payload.new, ...prev])
        setUnread(n => n + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [farmId])

  async function fetchAlerts(limit = 30) {
    setLoading(true)
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false })
      .limit(limit)
    setAlerts(data || [])
    setUnread((data || []).filter(a => !a.is_read).length)
    setLoading(false)
  }

  async function markRead(alertId) {
    await supabase.from('alerts').update({ is_read: true }).eq('id', alertId)
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a))
    setUnread(n => Math.max(0, n - 1))
  }

  async function markAllRead() {
    const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id)
    if (!unreadIds.length) return
    await supabase.from('alerts').update({ is_read: true }).in('id', unreadIds)
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
    setUnread(0)
  }

  return { alerts, unreadCount, loading, fetchAlerts, markRead, markAllRead }
}

