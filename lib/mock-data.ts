export type SensorReading = { time: string; temperature: number; humidity: number; light: number; voltage: number; current: number; power: number }
export type DeviceStatus = { id: string; name: string; type: 'light' | 'fan'; on: boolean; mode: 'AUTO' | 'MANUAL' }
export type Alert = { id: number; level: 'warning' | 'info' | 'success'; message: string; time: string }
export type AutomationRule = { id: string; name: string; description: string; active: boolean }

export const sensorReadings: SensorReading[] = [
  { time: '10:30', temperature: 25.8, humidity: 59, light: 390, voltage: 8.96, current: 0.68, power: 6.1 },
  { time: '10:32', temperature: 26.0, humidity: 60, light: 410, voltage: 8.98, current: 0.72, power: 6.5 },
  { time: '10:34', temperature: 26.1, humidity: 60, light: 430, voltage: 9.01, current: 0.77, power: 6.9 },
  { time: '10:36', temperature: 26.2, humidity: 61, light: 424, voltage: 9.02, current: 0.81, power: 7.3 },
  { time: '10:38', temperature: 26.2, humidity: 61, light: 418, voltage: 9.02, current: 0.79, power: 7.1 },
  { time: '10:40', temperature: 26.3, humidity: 61, light: 420, voltage: 9.02, current: 0.84, power: 7.58 },
  { time: '10:42', temperature: 26.4, humidity: 61, light: 420, voltage: 9.02, current: 0.84, power: 7.58 },
]

export const initialDevices: DeviceStatus[] = [
  { id: 'light-1', name: 'Light 1', type: 'light', on: true, mode: 'AUTO' },
  { id: 'light-2', name: 'Light 2', type: 'light', on: false, mode: 'AUTO' },
  { id: 'fan-1', name: 'Fan 1', type: 'fan', on: true, mode: 'AUTO' },
  { id: 'fan-2', name: 'Fan 2', type: 'fan', on: false, mode: 'MANUAL' },
]

export const initialAlerts: Alert[] = [
  { id: 1, level: 'warning', message: 'Temperature above preferred threshold', time: '10:42 AM' },
  { id: 2, level: 'success', message: 'Automatic lighting optimization activated', time: '10:38 AM' },
  { id: 3, level: 'info', message: 'Classroom became occupied', time: '10:31 AM' },
]

export const automationRules: AutomationRule[] = [
  { id: 'occupancy', name: 'Occupancy Detection', description: 'Track PIR motion and room presence', active: true },
  { id: 'temperature', name: 'Temperature Control', description: 'Start fans above 28°C', active: true },
  { id: 'lighting', name: 'Automatic Lighting', description: 'Optimize lights using LDR + occupancy', active: true },
  { id: 'energy', name: 'Energy Optimization', description: 'Reduce standby appliance operation', active: true },
  { id: 'security', name: 'Security Monitoring', description: 'Watch restricted-hour movement', active: true },
]

export const dailyEnergy = [
  { day: 'Mon', smart: 0.62, conventional: 1.3 }, { day: 'Tue', smart: 0.74, conventional: 1.4 },
  { day: 'Wed', smart: 0.68, conventional: 1.44 }, { day: 'Thu', smart: 0.72, conventional: 1.38 },
  { day: 'Fri', smart: 0.58, conventional: 1.28 }, { day: 'Sat', smart: 0.32, conventional: 0.62 }, { day: 'Sun', smart: 0.2, conventional: 0.42 },
]

export const activity = [
  { time: '10:42:18', title: 'Fan 1 → ON', detail: 'Temperature threshold exceeded' },
  { time: '10:41:32', title: 'Occupancy → Detected', detail: 'PIR sensor active' },
  { time: '10:40:15', title: 'Light 2 → OFF', detail: 'Room unoccupied' },
  { time: '10:38:02', title: 'Energy optimization → ACTIVE', detail: 'Smart schedule applied' },
]

export const pageLabels: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Real-time classroom intelligence at a glance' },
  monitoring: { title: 'Live Monitoring', subtitle: 'Sensor telemetry and real-time readings' },
  energy: { title: 'Energy Analytics', subtitle: 'Understand consumption and savings patterns' },
  automation: { title: 'Automation', subtitle: 'Control rules and appliance behavior' },
  security: { title: 'Security Center', subtitle: 'Classroom safety and access awareness' },
  alerts: { title: 'Alerts', subtitle: 'Review system notifications and events' },
  history: { title: 'System History', subtitle: 'Searchable record of classroom activity' },
  settings: { title: 'Settings', subtitle: 'Configure your smart classroom experience' },
}

export const navItems = [
  ['dashboard', 'Dashboard'], ['monitoring', 'Live Monitoring'], ['energy', 'Energy Analytics'], ['automation', 'Automation'], ['security', 'Security'], ['alerts', 'Alerts'], ['history', 'System History'], ['settings', 'Settings'],
]

export const iconMap: Record<string, string> = { dashboard: 'LayoutDashboard', monitoring: 'Activity', energy: 'Zap', automation: 'SlidersHorizontal', security: 'ShieldCheck', alerts: 'Bell', history: 'History', settings: 'Settings' }

export const formatNow = () => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date())
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const nav = navItems
export const readings = sensorReadings
export const devices = initialDevices
export const alerts = initialAlerts
export const rules = automationRules
export const energy = dailyEnergy
export const events = activity
export const pages = pageLabels
export const icons = iconMap
export const now = formatNow
export const bound = clamp
