from datetime import datetime

from app.mock.provider import MockClassroomProvider


def evaluate_automation(provider: MockClassroomProvider, restricted_hours: bool | None = None) -> None:
    """Apply safe low-voltage demo state rules; no physical actuator is connected."""
    sensors = provider.sensors()
    restricted = restricted_hours if restricted_hours is not None else (datetime.now().hour >= 18 or datetime.now().hour < 7)
    provider.set_automatic_states(
        fan_on=sensors.occupancy and sensors.temperature >= 28,
        light_on=sensors.occupancy and sensors.light_level < 300,
    )
    if sensors.motion and (restricted or sensors.light_level < 150):
        trigger = "Restricted Hours + PIR Motion" if restricted else "Darkness + PIR Motion"
        provider.simulate_security_event(trigger)
