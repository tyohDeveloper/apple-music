// One performer in a list: the preferred name, the kind, and any disambiguation.
import type { PerformerSummary } from "../../contracts/performers/performerSummarySchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type PerformerCardProps = { readonly messages: Messages; readonly performer: PerformerSummary; readonly onOpen: (performerId: string) => void };

export function PerformerCard({ messages, performer, onOpen }: PerformerCardProps) {
  return (
    <button type="button" class="card" data-testid={`button-performers-open-${performer.id}`} onClick={() => onOpen(performer.id)}>
      <span class="card-title">{performer.name}</span>
      <span class="card-meta">{messages.displayName("performerKind", performer.kind)}</span>
      {performer.disambiguation !== null && <span class="card-meta">{performer.disambiguation}</span>}
    </button>
  );
}
