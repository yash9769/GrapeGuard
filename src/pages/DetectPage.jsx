import { useState, useRef, useEffect } from 'react'
import { useFarm }      from '../hooks/useFarm'
import { useDetection } from '../hooks/useDetection'
import { useLang }      from '../lib/LangContext'
import { DISEASE_LABELS } from '../lib/constants'
import PageHeader        from '../components/ui/PageHeader'

export default function DetectPage() {
  const { lang }                    = useLang()
  const { farm }                    = useFarm()
  const { detect, loading, result, error, fetchHistory, history } = useDetection(farm?.id)
  const [preview, setPreview]       = useState(null)
  const [selectedFile, setFile]     = useState(null)
  const fileRef                     = useRef()

  useEffect(() => {
    if (farm?.id) fetchHistory(5)
  }, [farm?.id])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleDetect() {
    if (!selectedFile || !farm?.id) return
    await detect(selectedFile)
    fetchHistory(5)
  }

  function reset() {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="page-enter">
      <PageHeader
        title={lang === 'hi' ? 'रोग जांच 🔬' : 'Disease Check 🔬'}
        subtitle={lang === 'hi' ? 'पत्ती की फोटो से जांचें' : 'Detect via leaf photo'}
      />

      <div className="px-4 py-5 flex flex-col gap-5">

        {/* Upload area */}
        {!preview ? (
          <button
            className="border-3 border-dashed border-grape-300 rounded-3xl
                       flex flex-col items-center justify-center gap-4 py-14
                       bg-grape-50 active:bg-grape-100 transition w-full"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-6xl">📷</span>
            <div className="text-center">
              <p className="font-display font-bold text-grape-700 text-xl">
                {lang === 'hi' ? 'फोटो लें या अपलोड करें' : 'Take or Upload Photo'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {lang === 'hi' ? 'अंगूर की पत्ती की फोटो' : 'Grape leaf photo'}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative rounded-3xl overflow-hidden border-2 border-grape-200">
              <img src={preview} alt="leaf" className="w-full h-56 object-cover" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >✕</button>
            </div>

            <button
              className="btn-green"
              onClick={handleDetect}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner !w-6 !h-6 !border-white !border-t-transparent" />
                  {lang === 'hi' ? 'जांच हो रही है...' : 'Analyzing...'}
                </>
              ) : (
                <>{lang === 'hi' ? '🔍 जांचें' : '🔍 Analyze Leaf'}</>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && error === 'not_a_leaf' ? (
          <div className="rounded-3xl border-2 border-yellow-300 bg-yellow-50 p-6 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">&#x1F343;</span>
            <p className="font-display font-bold text-xl text-yellow-800">
              {lang === 'hi' ? 'पत्ती की फोटो लें!' : 'Please take a leaf photo!'}
            </p>
            <p className="text-sm text-yellow-700">
              {lang === 'hi'
                ? 'यह अंगूर की पत्ती नहीं लगती। कैमरे को पत्ती के पास लाएं।'
                : 'This does not look like a grape leaf. Point camera at a leaf and try again.'}
            </p>
            <button className="btn-primary mt-2" style={{background:'#eab308'}} onClick={reset}>
              {lang === 'hi' ? 'दोबारा कोशिश करें' : 'Try Again'}
            </button>
          </div>
        ) : error ? (
          <div className="card-red text-red-700 text-sm">{error}</div>
        ) : null}

        {/* Result */}
        {result && <ResultCard result={result} lang={lang} />}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="font-display font-bold text-gray-700 mb-3">
              📜 {lang === 'hi' ? 'पिछली जांच' : 'Past Detections'}
            </p>
            <div className="flex flex-col gap-2">
              {history.map(d => {
                const label = DISEASE_LABELS[d.result] || DISEASE_LABELS['unknown']
                return (
                  <div key={d.id} className={`card flex items-center gap-3 ${d.is_healthy ? '' : 'card-red'}`}>
                    <img src={d.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-display font-bold text-base">
                        {d.is_healthy ? '✅' : '🚨'} {lang === 'hi' ? label.hi : label.en}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.round(d.confidence)}% • {new Date(d.detected_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ result, lang }) {
  const label     = result.label || DISEASE_LABELS['unknown']
  const isHealthy = result.is_healthy
  const conf      = Math.round(result.confidence || 0)

  return (
    <div className={`rounded-3xl p-6 flex flex-col items-center gap-3 text-center border-2
                     ${isHealthy ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
      <span className="text-6xl">{isHealthy ? '✅' : '🚨'}</span>
      <h2 className="font-display text-3xl font-bold">
        {lang === 'hi' ? label.hi : label.en}
      </h2>
      <div className="flex items-center gap-2">
        <div className="h-2 rounded-full bg-gray-200 w-32">
          <div
            className={`h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${conf}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-600">{conf}%</span>
      </div>
      <p className="text-sm text-gray-500">
        {isHealthy
          ? (lang === 'hi' ? 'पत्ती स्वस्थ दिखती है!' : 'Leaf looks healthy!')
          : (lang === 'hi' ? 'तुरंत उपचार करें' : 'Take action immediately')}
      </p>
      {!isHealthy && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 text-sm text-yellow-800 text-left w-full">
          💡 {lang === 'hi'
            ? 'नजदीकी कृषि केंद्र से संपर्क करें।'
            : 'Contact your nearest agricultural center for treatment.'}
        </div>
      )}
    </div>
  )
}
