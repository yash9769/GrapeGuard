import { useFarm }   from '../hooks/useFarm'
import { useAlerts } from '../hooks/useAlerts'
import { useLang }   from '../lib/LangContext'
import PageHeader    from '../components/ui/PageHeader'
import AlertCard     from '../components/ui/AlertCard'

export default function AlertsPage() {
  const { lang }   = useLang()
  const { farm }   = useFarm()
  const { alerts, unreadCount, loading, markRead, markAllRead } = useAlerts(farm?.id)

  return (
    <div className="page-enter">
      <PageHeader
        title={lang === 'hi' ? `अलर्ट 🔔` : `Alerts 🔔`}
        subtitle={unreadCount > 0
          ? (lang === 'hi' ? `${unreadCount} नए अलर्ट` : `${unreadCount} unread`)
          : (lang === 'hi' ? 'सब पढ़े हुए' : 'All read')}
      />

      <div className="px-4 py-5 flex flex-col gap-4">
        {unreadCount > 0 && (
          <button className="btn-secondary py-3 text-base" onClick={markAllRead}>
            ✓ {lang === 'hi' ? 'सब पढ़ा हुआ मार्क करें' : 'Mark all as read'}
          </button>
        )}

        {loading && (
          <div className="flex flex-col gap-2">
            {[0,1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">🎉</span>
            <p className="font-display text-xl font-bold text-gray-600">
              {lang === 'hi' ? 'कोई अलर्ट नहीं!' : 'No Alerts!'}
            </p>
            <p className="text-gray-400 text-center">
              {lang === 'hi' ? 'आपका खेत ठीक है।' : 'Your farm is doing great.'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} lang={lang} onRead={markRead} />
          ))}
        </div>
      </div>
    </div>
  )
}

