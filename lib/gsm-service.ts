export type SecurityEvent = {
  id: string
  time: string
  room: string
  trigger: 'PIR Motion' | 'Restricted Hours' | 'System Armed'
  state: 'NORMAL' | 'WARNING'
  buzzer: 'OFF' | 'ACTIVE'
  gsm: 'READY' | 'ONLINE'
  sms: '—' | 'SMS SENT'
}

export type GsmStatus = {
  signal: number
  sim: 'READY'
  network: 'CONNECTED'
  sms: 'READY' | 'QUEUED'
  lastSms: string
  mode: 'LIVE'
}

export const gsmService = {
  simulateUnauthorizedEntry(): { event: SecurityEvent; status: GsmStatus } {
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return {
      event: { id: crypto.randomUUID(), time, room: 'A-101', trigger: 'PIR Motion', state: 'WARNING', buzzer: 'ACTIVE', gsm: 'ONLINE', sms: 'SMS SENT' },
      status: { signal: 82, sim: 'READY', network: 'CONNECTED', sms: 'QUEUED', lastSms: 'just now', mode: 'LIVE' },
    }
  },
}

export const initialSecurityEvents: SecurityEvent[] = [
  { id: 'armed', time: '10:15 PM', room: 'A-101', trigger: 'System Armed', state: 'NORMAL', buzzer: 'OFF', gsm: 'READY', sms: '—' },
]

export const initialGsmStatus: GsmStatus = { signal: 82, sim: 'READY', network: 'CONNECTED', sms: 'READY', lastSms: '2 minutes ago', mode: 'LIVE' }
export const isRestrictedHours = (date = new Date()) => date.getHours() >= 18 || date.getHours() < 7
