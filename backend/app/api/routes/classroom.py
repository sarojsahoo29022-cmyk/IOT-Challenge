from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.mock.provider import ClassroomProvider, MockClassroomProvider
from app.schemas.classroom import AlertEvent, DeviceCommand, DeviceControlResponse, DeviceStates, EnergyHistoryPoint, EnergyReading, SensorHistoryPoint, SensorIngest, SensorReading
from app.services.automation import evaluate_automation

router = APIRouter()
provider = MockClassroomProvider()


def get_provider() -> ClassroomProvider:
    return provider


@router.get("/sensors", response_model=SensorReading, tags=["Sensors"])
def read_sensors(source: ClassroomProvider = Depends(get_provider)) -> SensorReading:
    """Current simulated DHT11/PIR/LDR readings."""
    return source.sensors()


@router.post("/sensors", response_model=SensorReading, status_code=status.HTTP_202_ACCEPTED, tags=["Sensors"])
def ingest_sensors(payload: SensorIngest, source: ClassroomProvider = Depends(get_provider)) -> SensorReading:
    """Simulated ingestion endpoint for developing the future ESP32 payload contract."""
    if not isinstance(source, MockClassroomProvider):
        raise HTTPException(status_code=501, detail="Sensor ingestion is not configured for this provider")
    return source.ingest(payload)


@router.get("/energy", response_model=EnergyReading, tags=["Energy"])
def read_energy(source: ClassroomProvider = Depends(get_provider)) -> EnergyReading:
    """Demo energy values. Power is calculated as voltage × current."""
    return source.energy()


@router.get("/devices", response_model=DeviceStates, tags=["Devices"])
def read_devices(source: ClassroomProvider = Depends(get_provider)) -> DeviceStates:
    """Current simulated device state; no physical relay is connected."""
    return source.devices()


@router.post("/devices/control", response_model=DeviceControlResponse, tags=["Devices"])
def control_device(command: DeviceCommand, source: ClassroomProvider = Depends(get_provider)) -> DeviceControlResponse:
    """Update simulated device state only."""
    if command.device_id.value == "buzzer" and command.action.value == "AUTO":
        raise HTTPException(status_code=422, detail="AUTO mode is only supported for fan and light")
    if not isinstance(source, MockClassroomProvider):
        raise HTTPException(status_code=501, detail="Device control is not configured for this provider")
    status, mode = source.control_device(command.device_id, command.action.value)
    return DeviceControlResponse(device_id=command.device_id, status=status, mode=mode)


@router.get("/history/sensors", response_model=list[SensorHistoryPoint], tags=["History"])
def read_sensor_history(source: ClassroomProvider = Depends(get_provider)) -> list[SensorHistoryPoint]:
    """Mock historical temperature, humidity, light, and power samples."""
    return source.sensor_history()


@router.get("/history/energy", response_model=list[EnergyHistoryPoint], tags=["History"])
def read_energy_history(period: str = Query(default="day", pattern="^(day|week)$"), source: ClassroomProvider = Depends(get_provider)) -> list[EnergyHistoryPoint]:
    """Mock historical power, consumed energy, and energy savings."""
    return source.energy_history(period)


@router.get("/alerts", response_model=list[AlertEvent], tags=["Security"])
def read_alerts(source: ClassroomProvider = Depends(get_provider)) -> list[AlertEvent]:
    """Recent simulated security events (restricted-hours/night logic)."""
    return source.alerts()


@router.post("/alerts/{alert_id}/acknowledge", response_model=AlertEvent, tags=["Security"])
def acknowledge_alert(alert_id: str, source: ClassroomProvider = Depends(get_provider)) -> AlertEvent:
    if not isinstance(source, MockClassroomProvider):
        raise HTTPException(status_code=501, detail="Alert acknowledgement is not configured for this provider")
    event = source.acknowledge(alert_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return event


@router.post("/alerts/simulate", response_model=AlertEvent, status_code=status.HTTP_201_CREATED, tags=["Security"])
def simulate_alert(source: ClassroomProvider = Depends(get_provider)) -> AlertEvent:
    """Create a demo security alert and simulated buzzer event."""
    if not isinstance(source, MockClassroomProvider):
        raise HTTPException(status_code=501, detail="Alert simulation is only available with the demo provider")
    return source.simulate_security_event()


@router.post("/automation/evaluate", response_model=DeviceStates, tags=["Automation"])
def run_demo_automation(restricted_hours: bool | None = None, source: ClassroomProvider = Depends(get_provider)) -> DeviceStates:
    """Evaluate mock occupancy, temperature, light, and security rules on demand."""
    if not isinstance(source, MockClassroomProvider):
        raise HTTPException(status_code=501, detail="Demo automation is not configured for this provider")
    evaluate_automation(source, restricted_hours)
    return source.devices()
