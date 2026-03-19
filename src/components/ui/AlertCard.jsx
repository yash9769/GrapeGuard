import { SEVERITY_CONFIG } from '../../lib/constants'

export default function AlertCard({ alert, lang, onRead }) {
  const cfg   = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low
  const title = lang === 'hi' && alert.title_hi ? alert.title_hi : alert.title
  const msg   = lang === 'hi' && alert.message_hi ? alert.message_hi : alert.message
  const time  = new Date(alert.created_at).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className={`rounded-2xl border-2 p-4 flex gap-3 ${cfg.color}
                  ${!alert.is_read ? 'opacity-100' : 'opacity-60'}`}
      onClick={() => !alert.is_read && onRead?.(alert.id)}
    >
      <span className="text-2xl mt-0.5">{cfg.icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-base">{title}</p>
          {!alert.is_read && (
            <span className="w-2 h-2 rounded-full bg-current opacity-70 ml-2 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm mt-0.5">{msg}</p>
        <p className="text-xs opacity-60 mt-1">{time}</p>
      </div>
    </div>
  )
}

