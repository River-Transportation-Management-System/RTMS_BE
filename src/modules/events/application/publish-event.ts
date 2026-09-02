import { env } from "@/config/env";

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

  // Forward event to n8n webhook if N8N_WEBHOOK_BASE_URL is configured
  if (env.N8N_WEBHOOK_BASE_URL) {
    const webhookUrl = `${env.N8N_WEBHOOK_BASE_URL.replace(/\/$/, "")}/rtms-events`;
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        eventName: input.eventName,
        entityIds: input.entityIds,
        payload: input.payload,
        sourceService: input.sourceService,
        timestamp: input.timestamp.toISOString(),
      }),
    }).catch(err => {
      console.warn(`[Event Bus] Dispatch to n8n webhook (${webhookUrl}) failed:`, err?.message);
    });
  }

  return {
    eventId,
    acknowledged: true,
  };
}
