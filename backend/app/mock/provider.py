from datetime import datetime, timezone
from typing import Protocol
from uuid import uuid4

from app.schemas.classroom import AlertEvent, DeviceName, DeviceStates, EnergyHistoryPoint, EnergyReading, SensorHistoryPoint, SensorIngest, SensorReading, SwitchState


class ClassroomProvider(Protocol):
    def sensors(self) -> SensorReading: ...
    def energy(self) -> EnergyReading: ...
    def devices(self) -> DeviceStates: ...
    def control_device(self, device: DeviceName, action: str) -> tuple[str, str]: ...
    def alerts(self) -> list[AlertEvent]: ...
    def sensor_history(self) -> list[SensorHistoryPoint]: ...
    def energy_history(self, period: str = "day") -> list[EnergyHistoryPoint]: ...


class MockClassroomProvider:
    """In-memory DEMO provider; values and relay state are simulated only."""

    def __init__(self) -> None:
        self._sensors = SensorReading(temperature=26.4, humidity=61, motion=True, occupancy=True, light_level=420)
        self._voltage, self._current = 9.02, 0.84
        self._energy_consumed, self._energy_saved = 0.68, 0.76
        self._devices = DeviceStates(
            light_1=SwitchState(status="ON", mode="AUTO"),
            light_2=SwitchState(status="OFF", mode="AUTO"),
            fan_1=SwitchState(status="ON", mode="AUTO"),
            fan_2=SwitchState(status="OFF", mode="MANUAL"),
            buzzer=SwitchState(status="OFF"),
        )
        now = datetime.now(timezone.utc)
        self._alerts = [self._event("System armed", "info", "Classroom security monitoring is armed.", "System Armed", "NORMAL", "OFF", now)]

    def sensors(self) -> SensorReading:
        return self._sensors.model_copy(deep=True)

    def energy(self) -> EnergyReading:
        # Power is calculated from the demo INA219-like voltage/current values.
        return EnergyReading(voltage=self._voltage, current=self._current, power=round(self._voltage * self._current, 2), energy_consumed=self._energy_consumed, energy_saved=self._energy_saved)

    def devices(self) -> DeviceStates:
        return self._devices.model_copy(deep=True)

    def control_device(self, device: DeviceName, action: str) -> tuple[str, str]:
        state = getattr(self._devices, device.value)
        if action == "AUTO":
            state.mode = "AUTO"
        else:
            state.status, state.mode = action, "MANUAL"
        return state.status, state.mode

    def sensor_history(self) -> list[SensorHistoryPoint]:
        return [SensorHistoryPoint(**point) for point in [
            {"time": "10:30", "temperature": 25.8, "humidity": 59, "light_level": 390, "power": 6.1},
            {"time": "10:32", "temperature": 26.0, "humidity": 60, "light_level": 410, "power": 6.5},
            {"time": "10:34", "temperature": 26.1, "humidity": 60, "light_level": 430, "power": 6.9},
            {"time": "10:36", "temperature": 26.2, "humidity": 61, "light_level": 424, "power": 7.3},
            {"time": "10:38", "temperature": 26.2, "humidity": 61, "light_level": 418, "power": 7.1},
            {"time": "10:40", "temperature": 26.3, "humidity": 61, "light_level": 420, "power": 7.58},
            {"time": "10:42", "temperature": 26.4, "humidity": 61, "light_level": 420, "power": 7.58},
        ]]

    def energy_history(self, period: str = "day") -> list[EnergyHistoryPoint]:
        if period == "week":
            return [EnergyHistoryPoint(**point) for point in [
                {"label": "Mon", "power": 8.1, "energy_consumed": 42, "energy_saved": 16},
                {"label": "Tue", "power": 7.8, "energy_consumed": 38, "energy_saved": 15},
                {"label": "Wed", "power": 8.9, "energy_consumed": 46, "energy_saved": 20},
                {"label": "Thu", "power": 8.2, "energy_consumed": 41, "energy_saved": 17},
                {"label": "Fri", "power": 7.4, "energy_consumed": 35, "energy_saved": 14},
                {"label": "Sat", "power": 4.2, "energy_consumed": 18, "energy_saved": 8},
                {"label": "Sun", "power": 3.8, "energy_consumed": 12, "energy_saved": 6},
            ]]
        return [EnergyHistoryPoint(**point) for point in [
            {"label": "06 AM", "power": 1.2, "energy_consumed": 1.2, "energy_saved": 0.4},
            {"label": "08 AM", "power": 3.8, "energy_consumed": 3.8, "energy_saved": 1.1},
            {"label": "10 AM", "power": 5.7, "energy_consumed": 5.7, "energy_saved": 2.3},
            {"label": "12 PM", "power": 4.9, "energy_consumed": 4.9, "energy_saved": 2.0},
            {"label": "02 PM", "power": 6.4, "energy_consumed": 6.4, "energy_saved": 2.8},
            {"label": "04 PM", "power": 4.1, "energy_consumed": 4.1, "energy_saved": 1.8},
            {"label": "06 PM", "power": 2.7, "energy_consumed": 2.7, "energy_saved": 1.4},
        ]]

    def alerts(self) -> list[AlertEvent]:
        return [alert.model_copy(deep=True) for alert in self._alerts]

    def simulate_security_event(self, trigger: str = "PIR Motion") -> AlertEvent:
        alert = self._event("Security event", "warning", f"Motion detected ({trigger}) in Classroom A-101.", trigger, "WARNING", "ACTIVE", datetime.now(timezone.utc))
        self._alerts.insert(0, alert)
        self._devices.buzzer.status, self._devices.buzzer.mode = "ON", "AUTO"
        return alert.model_copy(deep=True)

    def ingest(self, reading: SensorIngest) -> SensorReading:
        # This endpoint is for local simulated ingestion; it does not assert ESP32 connectivity.
        self._sensors = SensorReading(temperature=reading.temperature, humidity=reading.humidity, motion=reading.motion, occupancy=reading.motion, light_level=reading.light_level)
        self._voltage, self._current = reading.voltage, reading.current
        return self.sensors()

    def acknowledge(self, alert_id: str) -> AlertEvent | None:
        for alert in self._alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                return alert.model_copy(deep=True)
        return None

    def set_automatic_states(self, fan_on: bool, light_on: bool) -> DeviceStates:
        for name in ("fan_1", "fan_2"):
            state = getattr(self._devices, name)
            if state.mode == "AUTO":
                state.status = "ON" if fan_on else "OFF"
        for name in ("light_1", "light_2"):
            state = getattr(self._devices, name)
            if state.mode == "AUTO":
                state.status = "ON" if light_on else "OFF"
        return self.devices()

    @staticmethod
    def _event(title: str, severity: str, message: str, trigger: str, state: str, buzzer: str, timestamp: datetime) -> AlertEvent:
        return AlertEvent(id=str(uuid4()), type=title, message=message, severity=severity, timestamp=timestamp, acknowledged=False,
                          time=timestamp.astimezone().strftime("%I:%M %p").lstrip("0"), trigger=trigger, state=state, buzzer=buzzer, gsm="READY", sms="—")
