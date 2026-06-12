CREATE TABLE IF NOT EXISTS "alerts" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "symbol" text NOT NULL,
  "triggerType" text NOT NULL,
  "triggerConfig" text NOT NULL,
  "cadence" text NOT NULL,
  "channels" text NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "lastState" text DEFAULT 'normal' NOT NULL,
  "lastEvaluationAt" timestamp,
  "lastTriggeredAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "alerts_userId_user_id_fk"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "alerts_userId_idx" ON "alerts" ("userId");
CREATE INDEX IF NOT EXISTS "alerts_userId_cadence_idx" ON "alerts" ("userId", "cadence");

CREATE TABLE IF NOT EXISTS "alert_events" (
  "id" text PRIMARY KEY NOT NULL,
  "alertId" text NOT NULL,
  "userId" text NOT NULL,
  "symbol" text NOT NULL,
  "triggerType" text NOT NULL,
  "triggerSnapshot" text NOT NULL,
  "status" text NOT NULL,
  "triggeredAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "alert_events_alertId_alerts_id_fk"
    FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE cascade,
  CONSTRAINT "alert_events_userId_user_id_fk"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "alert_events_alertId_idx" ON "alert_events" ("alertId");
CREATE INDEX IF NOT EXISTS "alert_events_userId_idx" ON "alert_events" ("userId");

CREATE TABLE IF NOT EXISTS "alert_deliveries" (
  "id" text PRIMARY KEY NOT NULL,
  "eventId" text NOT NULL,
  "channel" text NOT NULL,
  "outcome" text NOT NULL,
  "reason" text,
  "attemptedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "alert_deliveries_eventId_alert_events_id_fk"
    FOREIGN KEY ("eventId") REFERENCES "alert_events"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "alert_deliveries_eventId_idx" ON "alert_deliveries" ("eventId");

CREATE TABLE IF NOT EXISTS "user_alert_prefs" (
  "userId" text PRIMARY KEY NOT NULL,
  "quietHoursEnabled" boolean DEFAULT false NOT NULL,
  "quietStart" text,
  "quietEnd" text,
  "timezone" text DEFAULT 'UTC' NOT NULL,
  "channelDefaults" text,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_alert_prefs_userId_user_id_fk"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);