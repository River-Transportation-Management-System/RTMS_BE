export type PublishEventInput = {
  eventName: string;
  entityIds: any;
  payload: any;
  sourceService: string;
  timestamp: Date;
};

export async function publishEvent(input: PublishEventInput) {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  console.log(`[Event Bus] Received Event:
    ID: ${eventId}
    Name: ${input.eventName}
    Source: ${input.sourceService}
    Timestamp: ${input.timestamp.toISOString()}
    Entity IDs: ${JSON.stringify(input.entityIds)}
    Payload: ${JSON.stringify(input.payload)}
  `);

  return {
    eventId,
    acknowledged: true,
  };
}
