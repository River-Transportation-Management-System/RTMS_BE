# n8n workflows

Export reviewed n8n workflows as JSON into this directory. n8n coordinates
deadlines, waits and callbacks only; PostgreSQL remains the source of truth.

Suggested workflow files:

- `booking-created.json`
- `port-review-deadline.json`
- `vessel-response-deadline.json`
- `customer-selection-deadline.json`
- `final-confirmation-deadline.json`
- `booking-expired.json`
- `shipment-started.json`
- `workflow-error-handler.json`

Never place n8n credentials or production webhook secrets in exported files.
