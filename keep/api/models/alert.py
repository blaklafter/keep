from pydantic import AnyHttpUrl, BaseModel, Extra


class AlertDto(BaseModel):
    id: str
    name: str
    status: str
    lastReceived: str
    environment: str = "undefined"
    isDuplicate: bool | None = None
    duplicateReason: str | None = None
    service: str | None = None
    source: list[str] | None = []
    message: str | None = None
    description: str | None = None
    severity: str | None = None
    fatigueMeter: int | None = None
    pushed: bool = False  # Whether the alert was pushed or pulled from the provider
    event_id: str | None = None  # Database alert id
    url: AnyHttpUrl | None = None
    fingerprint: str | None = (
        None  # The fingerprint of the alert (used for alert de-duplication)
    )

    def __init__(self, **data):
        super().__init__(**data)
        # if no fingerprint was provided, use the alert name as fingerprint
        # todo: this should be configurable
        if self.fingerprint is None:
            self.fingerprint = self.name

    class Config:
        extra = Extra.allow
        schema_extra = {
            "examples": [
                {
                    "id": "1234",
                    "name": "Alert name",
                    "status": "firing",
                    "lastReceived": "2021-01-01T00:00:00.000Z",
                    "environment": "production",
                    "isDuplicate": False,
                    "duplicateReason": None,
                    "service": "backend",
                    "source": ["keep"],
                    "message": "Alert message",
                    "description": "Alert description",
                    "severity": "critical",
                    "fatigueMeter": 0,
                    "pushed": True,
                    "event_id": "1234",
                    "url": "https://www.google.com/search?q=open+source+alert+management",
                }
            ]
        }


class DeleteRequestBody(BaseModel):
    alert_name: str
