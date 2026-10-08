'use client'

import { useState } from 'react'
import { gsmService, initialGsmStatus, initialSecurityEvents, type GsmStatus, type SecurityEvent } from '@/lib/gsm-service'
import {
  Activity, BarChart3, Bell, Bolt, ChevronDown, Clock3, CloudSun,
  Eye, EyeOff, Gauge, LayoutDashboard, Lightbulb, LockKeyhole, LogOut, Menu,
  MoreHorizontal, Settings, ShieldCheck, SlidersHorizontal, Thermometer,
  UserRound, Wind, X, Zap,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Toaster, toast } from 'sonner'

type Page = 'Dashboard' | 'Live Monitoring' | 'Energy Analytics' | 'Automation' | 'Security' | 'Alerts' | 'System History' | 'Settings'
type Device = { name: string; icon: 'light' | 'fan'; on: boolean }

const pages: Page[] = ['Dashboard', 'Live Monitoring', 'Energy Analytics', 'Automation', 'Security', 'Alerts', 'System History', 'Settings']
const powerData = [
  { time: '10:00', power: 6.1 }, { time: '10:10', power: 6.8 }, { time: '10:20', power: 7.2 },
  { time: '10:30', power: 7 }, { time: '10:40', power: 8.1 }, { time: '10:50', power: 7.58 },
]

const analyticsData = {
  day: [
    { label: '06 AM', usage: 1.2, saved: 0.4 }, { label: '08 AM', usage: 3.8, saved: 1.1 },
    { label: '10 AM', usage: 5.7, saved: 2.3 }, { label: '12 PM', usage: 4.9, saved: 2.0 },
    { label: '02 PM', usage: 6.4, saved: 2.8 }, { label: '04 PM', usage: 4.1, saved: 1.8 },
    { label: '06 PM', usage: 2.7, saved: 1.4 },
  ],
  week: [
    { label: 'Mon', usage: 42, saved: 16 }, { label: 'Tue', usage: 38, saved: 15 },
    { label: 'Wed', usage: 46, saved: 20 }, { label: 'Thu', usage: 41, saved: 17 },
    { label: 'Fri', usage: 35, saved: 14 }, { label: 'Sat', usage: 18, saved: 8 }, { label: 'Sun', usage: 12, saved: 6 },
  ],
}

const deviceUsage = [
  { name: 'Lights', value: 42, color: '#55d6e8' }, { name: 'Fans', value: 31, color: '#86e7b5' },
  { name: 'Controller', value: 17, color: '#f7c873' }, { name: 'Sensors', value: 10, color: '#9caeca' },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

function Status({ children }: { children: React.ReactNode }) {
  return <span className="status"><i />{children}</span>
}

function Brand() {
  return <div className="brand"><div className="brand-mark"><Bolt /></div><div><strong>Smart<br />Classroom</strong><small>IoT CONTROL PLATFORM</small></div></div>
}

function Sidebar({ page, setPage, open, setOpen }: { page: Page; setPage: (page: Page) => void; open: boolean; setOpen: (open: boolean) => void }) {
  const icons = [LayoutDashboard, Activity, BarChart3, SlidersHorizontal, ShieldCheck, Bell, Clock3, Settings]
  return <>
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand-row"><Brand /><button className="close-side" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div>
      <div className="system-pill"><i /> SYSTEM ONLINE</div>
      <nav aria-label="Main navigation">{pages.map((name, index) => { const Icon = icons[index]; return <button key={name} className={page === name ? 'active' : ''} onClick={() => { setPage(name); setOpen(false) }}><Icon /><span>{name}</span>{name === 'Alerts' && <b>3</b>}</button> })}</nav>
      <div className="side-footer"><Status>System online</Status><small>Last sync · just now</small><div className="side-user"><span className="avatar">AD</span><span><strong>Admin</strong><small>Administrator</small></span><MoreHorizontal /></div></div>
    </aside>
    {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
  </>
}

function Header({ page, onMenu, onLogout }: { page: Page; onMenu: () => void; onLogout: () => void }) {
  return <header className="topbar"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu /></button><div><p className="eyebrow">CONTROL CENTER / A-101</p><h2>{page}</h2></div><div className="top-actions"><Status>Live data stream</Status><span className="clock"><Clock3 /> 10:52 AM</span><button className="icon-button" onClick={() => toast('No new notifications')} aria-label="Notifications"><Bell /><b>3</b></button><button className="profile-button"><span className="avatar">AD</span><span className="desktop-only">Admin</span><ChevronDown /></button><button className="icon-button" onClick={onLogout} aria-label="Log out"><LogOut /></button></div></header>
}

function Stat({ icon, label, value, unit, text }: { icon: React.ReactNode; label: string; value: string; unit?: string; text: string }) {
  return <Card className="stat-card"><div className="icon-box cyan">{icon}</div><div><small>{label}</small><strong>{value}<em>{unit}</em></strong><p>{text}</p></div></Card>
}

function ClassroomMap({ devices, motion, onMotion }: { devices: Device[]; motion: boolean; onMotion: () => void }) {
  const lightOn = devices.some(device => device.icon === 'light' && device.on)
  const fanOn = devices.some(device => device.icon === 'fan' && device.on)
  return <Card className="classroom-card"><div className="card-head"><div><p className="eyebrow">LIVE CLASSROOM</p><h3>A-101 spatial view</h3></div><div className="map-actions"><Status>{motion ? 'Motion detected' : 'Area secure'}</Status><button className="mini-btn" onClick={onMotion}>Check room response</button></div></div><div className="classroom-map"><div className={`ceiling-light light-a ${lightOn ? 'is-on' : ''}`}><Lightbulb /></div><div className={`ceiling-light light-b ${lightOn ? 'is-on' : ''}`}><Lightbulb /></div><div className={`ceiling-fan ${fanOn ? 'is-on' : ''}`}><Wind /></div><div className="window-strip"><i /><i /><i /></div><div className="whiteboard">SMART CLASSROOM</div>{[1, 2, 3, 4, 5, 6].map(desk => <div className="desk" key={desk}><span /><i /></div>)}<div className={`occupancy-dot ${motion ? 'motion' : ''}`}><UserRound /><span>28 present</span></div><div className="sensor sensor-pir"><span /><small>PIR</small></div><div className="sensor sensor-dht"><span /><small>DHT11</small></div><div className="door"><span>DOOR</span></div><div className="controller"><Zap /><small>ESP32</small></div></div><div className="map-legend"><span><i className="legend-live" /> Sensors online</span><span><i className="legend-cyan" /> Automation active</span></div></Card>
}

function AutomationFlow() {
  return <Card className="flow-card"><div className="card-head"><div><p className="eyebrow">AUTOMATION FLOW</p><h3>Intelligence in motion</h3></div><span className="live-label"><i /> LIVE</span></div><div className="flow"><div className="flow-node"><span><Activity /></span><strong>Sensors</strong><small>PIR · DHT11 · LDR</small></div><div className="flow-line" /><div className="flow-node active"><span><Zap /></span><strong>ESP32</strong><small>Decision layer</small></div><div className="flow-line" /><div className="flow-node"><span><Lightbulb /></span><strong>Appliances</strong><small>Lights · fans</small></div></div></Card>
}

function Dashboard({ devices, toggle, motion, onMotion }: { devices: Device[]; toggle: (index: number) => void; motion: boolean; onMotion: () => void }) {
  return <><div className="welcome"><div><p className="eyebrow">WEDNESDAY, OCTOBER 05, 2026</p><h1>Good morning, <span>Admin</span></h1><p>Here&apos;s what&apos;s happening in <strong>Classroom A-101</strong> right now.</p></div><Status>System online</Status></div>
    <div className="stat-grid"><Stat icon={<Thermometer />} label="Temperature" value="26.4" unit="°C" text="+0.8°C from last hour" /><Stat icon={<CloudSun />} label="Humidity" value="61" unit="%" text="Within comfort range" /><Stat icon={<Lightbulb />} label="Light level" value="420" unit=" lux" text="Good · ambient light" /><Stat icon={<UserRound />} label="Occupancy" value="Occupied" text="Motion detected · 28 people" /></div>
    <div className="visual-grid"><ClassroomMap devices={devices} motion={motion} onMotion={onMotion} /><div className="visual-stack"><AutomationFlow /><Card className="saving-card"><div><p className="eyebrow">ENERGY SAVING / LIVE INSIGHT</p><h3>Smarter by design</h3><p>Estimated daily reduction from presence-aware automation.</p></div><div className="saving-gauge"><strong>52.8<em>%</em></strong><span>estimated saving</span></div><div className="saving-bars"><span><b>Conventional</b><i style={{ '--bar': '88%' } as React.CSSProperties} /></span><span><b>Smart</b><i style={{ '--bar': '42%' } as React.CSSProperties} /></span><small>1.44 kWh/day <strong>→</strong> 0.68 kWh/day</small></div></Card></div></div>
    <div className="main-grid"><Card className="energy-card"><div className="card-head"><div><p className="eyebrow">REAL-TIME ENERGY MONITORING</p><h3>Live power consumption</h3></div><Status>Updates every 2 seconds</Status></div><div className="energy-metrics"><div><small>Voltage</small><strong>9.02 <em>V</em></strong></div><div><small>Current</small><strong>0.84 <em>A</em></strong></div><div><small>Power</small><strong>7.58 <em>W</em></strong></div><div><small>Energy consumed</small><strong>0.42 <em>Wh</em></strong></div></div><ResponsiveContainer width="100%" height={220}><AreaChart data={powerData}><defs><linearGradient id="power-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#55d6e8" stopOpacity={0.35} /><stop offset="1" stopColor="#55d6e8" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#71819a', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Area type="monotone" dataKey="power" stroke="#55d6e8" fill="url(#power-fill)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></Card>
      <Card className="room-card"><p className="eyebrow">ROOM STATUS</p><h3>Classroom A-101</h3><div className="room-gauge"><Gauge /><strong>Good</strong><small>Comfort index</small></div><div className="room-details"><span><Thermometer /> 26.4°C</span><span><Wind /> 0.8 m/s</span></div></Card></div>
    <Card className="devices-card"><div className="card-head"><div><p className="eyebrow">CONNECTED DEVICES</p><h3>Quick controls</h3></div><Status>4 online</Status></div><div className="device-grid">{devices.map((device, index) => <button className={`device ${device.on ? 'device-on' : ''}`} key={device.name} onClick={() => toggle(index)}><span className="device-icon">{device.icon === 'light' ? <Lightbulb /> : <Wind />}</span><span><strong>{device.name}</strong><small>{device.on ? 'On · automatic' : 'Off · manual'}</small></span><span className="switch" aria-hidden="true"><i /></span></button>)}</div></Card>
  </>
}

function SecurityLock({ status }: { status: 'locked' | 'authenticating' | 'granted' | 'denied' }) {
  return <div className={`security-lock ${status}`} aria-label={`Security access ${status}`}><div className="lock-radar" /><div className="lock-core"><LockKeyhole /></div><span>{status === 'authenticating' ? 'AUTHENTICATING...' : status === 'granted' ? 'ACCESS GRANTED' : status === 'denied' ? 'ACCESS DENIED' : 'SYSTEM LOCKED'}</span></div>
}

function SecurityPage({ events, gsm, onSimulate, restricted, setRestricted }: { events: SecurityEvent[]; gsm: GsmStatus; onSimulate: () => void; restricted: boolean; setRestricted: (value: boolean) => void }) {
  const latest = events[0]
  return <div className="security-page"><div className="page-intro security-intro"><div><p className="eyebrow">NIGHT SECURITY / GSM RESPONSE</p><h1>Security command center</h1><p>Protecting A-101 with connected safety hardware and responsive energy controls.</p></div><button className="primary-btn" onClick={onSimulate}><ShieldCheck /> Trigger security response</button></div>
    <div className="security-grid"><Card className={`radar-card ${latest.state === 'WARNING' ? 'warning' : ''}`}><div className="card-head"><div><p className="eyebrow">SECURITY RADAR</p><h3>{latest.state === 'WARNING' ? 'Unauthorized motion detected' : 'Area secure'}</h3></div><Status>{latest.state === 'WARNING' ? 'WARNING' : 'ARMED'}</Status></div><div className="security-radar"><div className="radar-sweep" /><div className="radar-ring ring-one" /><div className="radar-ring ring-two" /><div className="radar-center" />{latest.state === 'WARNING' && <span className="radar-detection" />}</div><div className="radar-caption"><span><i className="legend-live" /> PIR online</span><span>Restricted hours: {restricted ? 'ACTIVE' : 'OFF'}</span></div></Card>
      <Card className="gsm-card"><div className="card-head"><div><p className="eyebrow">GSM SECURITY MODULE</p><h3><i className="online-dot" /> Online</h3></div><span className="simulation-label">SECURITY LINK</span></div><div className="gsm-grid"><div><small>Signal strength</small><strong>{gsm.signal}%</strong><div className="signal-bars">{[1,2,3,4,5].map(bar => <i className={bar <= Math.round(gsm.signal / 20) ? 'filled' : ''} key={bar} />)}</div></div><div><small>SIM status</small><strong>{gsm.sim}</strong></div><div><small>Network</small><strong>{gsm.network}</strong></div><div><small>SMS service</small><strong>{gsm.sms}</strong></div></div><p className="hardware-note">Hardware: NOT CONNECTED · SMS: SIMULATED · Last SMS: {gsm.lastSms}</p></Card></div>
    <div className="security-grid lower"><Card className="alert-card"><div className="card-head"><div><p className="eyebrow">LATEST SECURITY ALERT</p><h3>Unauthorized movement detected</h3></div><span className="warning-badge">WARNING</span></div><div className="alert-details"><span><small>Location</small><strong>Classroom A-101</strong></span><span><small>Trigger</small><strong>{latest.trigger}</strong></span><span><small>Action</small><strong>Buzzer {latest.buzzer}</strong></span><span><small>SMS</small><strong>{latest.sms === '—' ? 'READY TO SEND' : latest.sms}</strong></span></div><div className="response-flow">{['Motion detected','Event created','Buzzer triggered','GSM activated','SMS queued','Simulated SMS sent'].map((step, index) => <div className="response-step" key={step}><span>{index + 1}</span><small>{step}</small></div>)}</div></Card><Card className="settings-card"><p className="eyebrow">SECURITY SETTINGS</p><h3>Restricted hours</h3><div className="hours"><strong>06:00 PM</strong><span>to</span><strong>07:00 AM</strong></div><label className="setting-toggle"><span><b>Security mode</b><small>Arm night response logic</small></span><input type="checkbox" checked={restricted} onChange={event => setRestricted(event.target.checked)} /><i /></label><label className="setting-toggle"><span><b>SMS alerts</b><small>Recipient: +91 XXXXX XXXXX</small></span><input type="checkbox" defaultChecked /><i /></label><p className="hardware-note">SMS destination will connect to the GSM module during hardware integration.</p></Card></div>
    <Card className="history-card"><div className="card-head"><div><p className="eyebrow">SECURITY EVENT HISTORY</p><h3>Recent response events</h3></div><span className="simulation-label">FILTER · ALL</span></div><div className="event-table"><div className="event-row event-head"><span>Time</span><span>Room</span><span>Trigger</span><span>State</span><span>Buzzer</span><span>GSM / SMS</span></div>{events.map(event => <div className="event-row" key={event.id}><span>{event.time}</span><span>{event.room}</span><span>{event.trigger}</span><span className={event.state === 'WARNING' ? 'text-warning' : ''}>{event.state}</span><span>{event.buzzer}</span><span>{event.sms}</span></div>)}</div></Card>
  </div>
}

function AnalyticsPage() {
  const [range, setRange] = useState<'day' | 'week'>('day')
  const data = analyticsData[range]
  return <div className="analytics-page"><div className="page-intro analytics-intro"><div><p className="eyebrow">CONSUMPTION INSIGHTS</p><h1>Energy Analytics</h1><p>See how intelligent automation turns classroom activity into measurable savings.</p></div><div className="range-toggle" role="group" aria-label="Analytics time range"><button className={range === 'day' ? 'active' : ''} onClick={() => setRange('day')}>Today</button><button className={range === 'week' ? 'active' : ''} onClick={() => setRange('week')}>This week</button></div></div><div className="analytics-stats"><Card className="analytics-stat"><span className="stat-icon cyan"><Zap /></span><small>Energy used</small><strong>{range === 'day' ? '28.8' : '232'} <em>{range === 'day' ? 'Wh' : 'kWh'}</em></strong><b className="trend-down">↓ 12.4% vs baseline</b></Card><Card className="analytics-stat"><span className="stat-icon green"><ShieldCheck /></span><small>Energy saved</small><strong>{range === 'day' ? '11.8' : '96'} <em>{range === 'day' ? 'Wh' : 'kWh'}</em></strong><b className="trend-down">↓ 29.6% avoided</b></Card><Card className="analytics-stat"><span className="stat-icon amber"><Gauge /></span><small>Peak demand</small><strong>{range === 'day' ? '6.4' : '8.9'} <em>W</em></strong><b>02:00 PM · Lights + fans</b></Card></div><div className="analytics-grid"><Card className="analytics-chart-card"><div className="card-head"><div><p className="eyebrow">POWER PROFILE</p><h3>Usage vs energy saved</h3></div><span className="chart-live"><i /> LIVE</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55d6e8" stopOpacity={0.35} /><stop offset="100%" stopColor="#55d6e8" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#8ea4be', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#8ea4be', fontSize: 10 }} axisLine={false} tickLine={false} unit={range === 'day' ? ' W' : ' kWh'} /><Tooltip contentStyle={{ background: '#10263b', border: '1px solid #55d6e855', borderRadius: 10, color: '#eef7ff' }} /><Legend wrapperStyle={{ fontSize: 11, color: '#9caeca' }} /><Area type="monotone" dataKey="usage" name="Usage" stroke="#55d6e8" strokeWidth={2.5} fill="url(#usageFill)" /><Area type="monotone" dataKey="saved" name="Saved" stroke="#86e7b5" strokeWidth={2} fill="none" /></AreaChart></ResponsiveContainer></div></Card><Card className="analytics-device-card"><div className="card-head"><div><p className="eyebrow">DEVICE BREAKDOWN</p><h3>Where power goes</h3></div><Bolt /></div><div className="device-bars">{deviceUsage.map(device => <div className="device-bar" key={device.name}><div><span>{device.name}</span><strong>{device.value}%</strong></div><div className="bar-track"><i style={{ width: `${device.value}%`, background: device.color }} /></div></div>)}</div><div className="efficiency-callout"><ShieldCheck /><span><strong>Automation is working</strong><small>Presence-aware controls avoided 11.8 Wh today.</small></span></div></Card></div><Card className="analytics-column-card"><div className="card-head"><div><p className="eyebrow">SAVING RHYTHM</p><h3>Efficiency by interval</h3></div><span className="simulation-label">AUTOMATION IMPACT</span></div><div className="bar-chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#8ea4be', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#8ea4be', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" /><Tooltip contentStyle={{ background: '#10263b', border: '1px solid #55d6e855', borderRadius: 10, color: '#eef7ff' }} /><Bar dataKey="saved" name="Avoided energy" radius={[5, 5, 0, 0]}>{data.map((entry, index) => <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#55d6e8' : '#397c91'} />)}</Bar></BarChart></ResponsiveContainer></div></Card></div>
}

function Generic({ page }: { page: Page }) {
  const details: Record<Page, { eyebrow: string; title: string; description: string; metrics: [string, string, string][] }> = {
    Dashboard: { eyebrow: 'SMART CLASSROOM / A-101', title: 'Dashboard', description: 'Your classroom at a glance.', metrics: [['System health', '98.4%', 'All services operational'], ['Active devices', '4 / 4', 'Connected and responding'], ['Today\'s energy', '2.84 kWh', '12% below average']] },
    'Live Monitoring': { eyebrow: 'REAL-TIME TELEMETRY', title: 'Live Monitoring', description: 'Watch classroom conditions as they change.', metrics: [['Temperature', '26.4°C', 'Comfortable'], ['Humidity', '61%', 'Within range'], ['Occupancy', '28 people', 'Motion detected']] },
    'Energy Analytics': { eyebrow: 'CONSUMPTION INSIGHTS', title: 'Energy Analytics', description: 'Understand when and where energy is being used.', metrics: [['Current draw', '7.58 W', 'Live reading'], ['Daily total', '2.84 kWh', '12% lower than yesterday'], ['Peak hour', '11:00 AM', '8.9 W maximum']] },
    Automation: { eyebrow: 'RULES & SCENARIOS', title: 'Automation', description: 'Manage the rules that keep your classroom comfortable.', metrics: [['Active rules', '6', 'All enabled'], ['Last run', '10:50 AM', 'Lights adjusted'], ['Next schedule', '12:30 PM', 'Ventilation check']] },
    Security: { eyebrow: 'ACCESS & SAFETY', title: 'Security', description: 'Review access, device trust, and classroom safety.', metrics: [['System status', 'Secure', 'No incidents'], ['Trusted devices', '4', 'All verified'], ['Last audit', 'Today', '10:42 AM']] },
    Alerts: { eyebrow: 'ATTENTION REQUIRED', title: 'Alerts', description: 'Review notifications and resolve classroom events.', metrics: [['Open alerts', '3', '2 informational'], ['Resolved today', '8', 'No critical issues'], ['Response time', '42 sec', 'Average']] },
    'System History': { eyebrow: 'AUDIT LOG', title: 'System History', description: 'Trace device activity and system events.', metrics: [['Events today', '124', 'Across 4 devices'], ['Last event', '10:52 AM', 'Fan 1 status changed'], ['Uptime', '14d 06h', 'Since last restart']] },
    Settings: { eyebrow: 'WORKSPACE CONFIGURATION', title: 'Settings', description: 'Configure your classroom control center.', metrics: [['Classroom', 'A-101', 'Primary room'], ['Data mode', 'Live', 'Connected to classroom systems'], ['Sync interval', '2 sec', 'Automatic updates']] },
  }
  const detail = details[page]
  return <div className="page-intro"><p className="eyebrow">{detail.eyebrow}</p><h1>{detail.title}</h1><p>{detail.description}</p><div className="secondary-grid">{detail.metrics.map(([label, value, note]) => <Card key={label} className="metric-card"><small>{label}</small><strong>{value}</strong><span>{note}</span></Card>)}</div><Card className="generic-card"><div className="icon-box cyan"><Activity /></div><div><h3>{page} is ready</h3><p>Live classroom values are synchronized through the ESP32 controller and backend API.</p></div><button className="primary-btn" onClick={() => toast('System refreshed')}>Refresh system <Zap /></button></Card></div>
}

export default function Page() {
  const [logged, setLogged] = useState(false)
  const [page, setPage] = useState<Page>('Dashboard')
  const [sideOpen, setSideOpen] = useState(false)
  const [motion, setMotion] = useState(false)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(initialSecurityEvents)
  const [gsm, setGsm] = useState<GsmStatus>(initialGsmStatus)
  const [restricted, setRestricted] = useState(true)
  const [lockStatus, setLockStatus] = useState<'locked' | 'authenticating' | 'granted' | 'denied'>('locked')
  const [showPassword, setShowPassword] = useState(false)
  const [devices, setDevices] = useState<Device[]>([
    { name: 'Light 1', icon: 'light', on: true }, { name: 'Light 2', icon: 'light', on: false },
    { name: 'Fan 1', icon: 'fan', on: true }, { name: 'Fan 2', icon: 'fan', on: false },
  ])
  const toggle = (index: number) => { const device = devices[index]; setDevices(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, on: !item.on } : item)); toast(`${device.name} toggled`) }
  const simulateMotion = () => { setMotion(true); toast('Motion detected in A-101'); window.setTimeout(() => setMotion(false), 5000) }
  const simulateUnauthorizedEntry = () => { const result = gsmService.simulateUnauthorizedEntry(); setMotion(true); setGsm(result.status); setSecurityEvents(current => [result.event, ...current]); toast('Security alert triggered — SMS queued for authorized number.'); window.setTimeout(() => setMotion(false), 6500) }
  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setLockStatus('authenticating'); window.setTimeout(() => { setLockStatus('granted'); window.setTimeout(() => setLogged(true), 650) }, 900) }
  const logout = () => { setLogged(false); setLockStatus('locked') }
  if (!logged) return <main className="login-screen"><div className="login-grid"><section className="login-story"><div className="login-brand"><Brand /></div><div className="story-copy"><p className="eyebrow">SMART CLASSROOM / INTELLIGENT CONTROL</p><h1>Every room.<br /><span>Safely in sync.</span></h1><p>One secure command center for calmer classrooms, responsive safety, and energy that works smarter.</p></div><div className="energy-orbit"><div className="orbit-glow" /><div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" /><div className="orbit-node node-security"><ShieldCheck /><small>SECURITY</small></div><div className="orbit-node node-energy"><Zap /><small>ENERGY SAVED</small></div><div className="orbit-core"><LockKeyhole /><strong>24/7</strong><span>CONNECTED CARE</span></div></div><div className="story-footer"><span><i /> PLATFORM ONLINE</span><span>SECURITY + ENERGY INTELLIGENCE</span></div></section><section className="login-card"><div className="access-heading"><span className="access-index">01</span><div><p className="eyebrow">AUTHORIZED ACCESS</p><h2>Welcome back</h2><p>Sign in to your classroom control center.</p></div></div><div className="access-divider"><span>SECURE SESSION</span><i /></div><form onSubmit={submitLogin}><label>Username<input placeholder="admin" required /></label><label>Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} placeholder="admin123" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label><button className="login-btn" disabled={lockStatus === 'authenticating'}>Enter dashboard <span>→</span></button></form><div className="access-status"><SecurityLock status={lockStatus} /><small><LockKeyhole /> End-to-end protected workspace</small></div></section></div><Toaster theme="dark" /></main>
  return <div className="app-shell"><Sidebar page={page} setPage={setPage} open={sideOpen} setOpen={setSideOpen} /><div className="content"><Header page={page} onMenu={() => setSideOpen(true)} onLogout={logout} /><main className="page-content">{page === 'Dashboard' ? <Dashboard devices={devices} toggle={toggle} motion={motion} onMotion={simulateUnauthorizedEntry} /> : page === 'Energy Analytics' ? <AnalyticsPage /> : page === 'Security' ? <SecurityPage events={securityEvents} gsm={gsm} onSimulate={simulateUnauthorizedEntry} restricted={restricted} setRestricted={setRestricted} /> : <Generic page={page} />}</main></div><Toaster theme="dark" /></div>
}
