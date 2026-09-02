# Najib Shared Contracts

This package is the versioned language used between Najib services. It contains
Zod runtime schemas and matching TypeScript types for HTTP commands, responses,
and asynchronous events.

## Rules

- Contracts contain transport data only, never Mongoose models or database code.
- Prices are integer minor units plus a three-letter currency.
- Critical commands include an idempotency key and correlation ID.
- Cross-service identifiers are strings; a service validates its own internal
  MongoDB identifiers where required.
- Published event names and payloads are immutable. A breaking change creates a
  new event version instead of modifying version 1.
- Consumers validate every incoming command or event before processing it.

## Event envelope

Every asynchronous event contains an event ID, versioned event type, timestamp,
producer, correlation ID, optional causation ID, and a validated payload.

Current version 1 events are:

- `inventory.reservation.changed.v1`
- `commerce.order.status-changed.v1`
- `payment.status-changed.v1`
