from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class SensorReading(BaseModel):
    temperature: float = Field(ge=-40, le=125)
    humidity: float = Field(ge=0, le=100)
    motion: bool
    occupancy: bool
    light_level: int = Field(ge=0, le=100_000)


class SensorIngest(BaseModel):
    """Future ESP32 payload. Occupancy is inferred from motion on ingestion."""

    model_config = ConfigDict(extra="forbid")
    temperature: float = Field(ge=-40, le=125)
    humidity: float = Field(ge=0, le=100)
    motion: bool
    light_level: int = Field(ge=0, le=100_000)
    voltage: float = Field(ge=0, le=1000)
    current: float = Field(ge=0, le=1000)


class EnergyReading(BaseModel):
    voltage: float = Field(ge=0)
    current: float = Field(ge=0)
    power: float = Field(ge=0)
    energy_consumed: float = Field(ge=0)
    energy_saved: float = Field(ge=0)


class DeviceName(str, Enum):
    light_1 = "light_1"
    light_2 = "light_2"
    fan_1 = "fan_1"
    fan_2 = "fan_2"
    buzzer = "buzzer"


class DeviceAction(str, Enum):
    on = "ON"
    off = "OFF"
    auto = "AUTO"


class SwitchState(BaseModel):
    status: str
    mode: str = "MANUAL"


class DeviceStates(BaseModel):
    light_1: SwitchState
    light_2: SwitchState
    fan_1: SwitchState
    fan_2: SwitchState
    buzzer: SwitchState


class DeviceCommand(BaseModel):
    model_config = ConfigDict(extra="forbid")
    device_id: DeviceName
    action: DeviceAction


class DeviceControlResponse(BaseModel):
    device_id: DeviceName
    status: str
    mode: str


class SensorHistoryPoint(BaseModel):
    time: str
    temperature: float
    humidity: float
    light_level: int
    power: float


class EnergyHistoryPoint(BaseModel):
    label: str
    power: float
    energy_consumed: float
    energy_saved: float


class AlertEvent(BaseModel):
    id: str
    type: str
    message: str
    severity: str
    timestamp: datetime
    acknowledged: bool = False
    # Compatibility fields for the existing Security page's event table.
    time: str
    room: str = "A-101"
    trigger: str
    state: str
    buzzer: str
    gsm: str = "READY"
    sms: str = "—"


class AlertAcknowledgement(BaseModel):
    acknowledged: bool


class DemoStatus(BaseModel):
    mode: str = "DEMO"
    hardware_connected: bool = False
