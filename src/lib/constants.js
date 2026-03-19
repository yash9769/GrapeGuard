// Sensor alert thresholds
export const THRESHOLDS = {
  temperature: { low: 10, high: 38 },   // Celsius
  humidity:    { low: 40, high: 90 },   // %
  soil_moisture:{ low: 20, high: 85 },  // %
}

// Disease labels (English + Hindi)
export const DISEASE_LABELS = {
  healthy:             { en: 'Healthy',             hi: 'स्वस्थ',              color: 'safe' },
  powdery_mildew:      { en: 'Powdery Mildew',      hi: 'पाउडरी फफूंदी',       color: 'danger' },
  downy_mildew:        { en: 'Downy Mildew',        hi: 'डाउनी फफूंदी',        color: 'danger' },
  leaf_blight:         { en: 'Leaf Blight',         hi: 'पत्ती झुलसा',         color: 'danger' },
  anthracnose:         { en: 'Anthracnose',         hi: 'एन्थ्राकनोज',          color: 'danger' },
  botrytis:            { en: 'Botrytis (Gray Mold)',hi: 'ग्रे फफूंदी',         color: 'danger' },
  unknown:             { en: 'Unknown',             hi: 'अज्ञात',              color: 'warn' },
}

// Alert severity config
export const SEVERITY_CONFIG = {
  high:   { color: 'bg-red-100 border-red-400 text-red-800',    icon: '🚨' },
  medium: { color: 'bg-yellow-100 border-yellow-400 text-yellow-800', icon: '⚠️' },
  low:    { color: 'bg-blue-100 border-blue-400 text-blue-800', icon: 'ℹ️' },
}

// App strings (bilingual)
export const STRINGS = {
  appName:      { en: 'GrapeGuard',      hi: 'GrapeGuard' },
  dashboard:    { en: 'Dashboard',       hi: 'डैशबोर्ड' },
  sensors:      { en: 'Sensors',         hi: 'सेंसर' },
  detection:    { en: 'Disease Check',   hi: 'रोग जांच' },
  alerts:       { en: 'Alerts',          hi: 'अलर्ट' },
  temperature:  { en: 'Temperature',     hi: 'तापमान' },
  humidity:     { en: 'Humidity',        hi: 'नमी' },
  soil_moisture:{ en: 'Soil Moisture',   hi: 'मिट्टी की नमी' },
  upload:       { en: 'Take / Upload Photo', hi: 'फोटो खींचें / अपलोड करें' },
  analyze:      { en: 'Analyze Leaf',    hi: 'पत्ती की जांच करें' },
  result:       { en: 'Result',          hi: 'परिणाम' },
  loading:      { en: 'Checking...',     hi: 'जांच हो रही है...' },
  login:        { en: 'Login',           hi: 'लॉगिन' },
  logout:       { en: 'Logout',          hi: 'लॉगआउट' },
  email:        { en: 'Email',           hi: 'ईमेल' },
  password:     { en: 'Password',        hi: 'पासवर्ड' },
  name:         { en: 'Your Name',       hi: 'आपका नाम' },
  noAlerts:     { en: 'No alerts today', hi: 'आज कोई अलर्ट नहीं' },
}

