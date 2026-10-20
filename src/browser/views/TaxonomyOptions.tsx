import type { Messages } from "../controllers/useMessages.ts";

type Taxonomy = { readonly taxonomy: string; readonly entries: readonly { readonly id: string }[] };

type TaxonomyOptionsProps = { readonly messages: Messages; readonly taxonomy: Taxonomy; readonly selected?: string };

// The entries of a taxonomy as options. An uncontrolled select starts at `selected`: Preact
// sets no default value on a select, so the default is marked on its option.
export function TaxonomyOptions({ messages, taxonomy, selected }: TaxonomyOptionsProps) {
  return (
    <>
      {taxonomy.entries.map((entry) => (
        <option key={entry.id} value={entry.id} selected={entry.id === selected}>
          {messages.displayName(taxonomy.taxonomy, entry.id)}
        </option>
      ))}
    </>
  );
}
