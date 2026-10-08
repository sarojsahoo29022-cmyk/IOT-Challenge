const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export type LiveSensors = { temperature: number; humidity: number; motion: boolean; occupancy: boolean; light_level: number }
export type LiveEnergy = { voltage: number; current: number; power: number; energy_consumed: number; energy_saved: number }
export type LiveDevices = Record<'light_1' | 'light_2' | 'fan_1' | 'fan_2' | 'buzzer', { status: 'ON' | 'OFF'; mode: 'AUTO' | 'MANUAL' }>
export type SensorHistoryPoint = { time: string; temperature: number; humidity: number; light_level: number; power: number }
export type EnergyHistoryPoint = { label: string; power: number; energy_consumed: number; energy_saved: number }
export type DeviceControlResult = { device_id: keyof LiveDevices; status: 'ON' | 'OFF'; mode: 'AUTO' | 'MANUAL' }
export type ApiAlert = { id: string; type: string; message: string; severity: string; timestamp: string; acknowledged: boolean; time: string; room: string; trigger: string; state: 'NORMAL' | 'WARNING'; buzzer: 'OFF' | 'ACTIVE'; gsm: 'READY' | 'ONLINE'; sms: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers }, cache: 'no-store' })
  if (!response.ok) throw new Error(`Classroom API request failed (${response.status})`)
  return response.json() as Promise<T>
}

export const classroomApi = {
  sensors: () => request<LiveSensors>('/sensors'),
  energy: () => request<LiveEnergy>('/energy'),
  devices: () => request<LiveDevices>('/devices'),
  control: (device_id: Exclude<keyof LiveDevices, 'buzzer'>, action: 'ON' | 'OFF' | 'AUTO') => request<DeviceControlResult>('/devices/control', { method: 'POST', body: JSON.stringify({ device_id, action }) }),
  sensorHistory: () => request<SensorHistoryPoint[]>('/history/sensors'),
  energyHistory: (period: 'day' | 'week' = 'day') => request<EnergyHistoryPoint[]>(`/history/energy?period=${period}`),
  alerts: () => request<ApiAlert[]>('/alerts'),
  simulateAlert: () => request<ApiAlert>('/alerts/simulate', { method: 'POST' }),
}
