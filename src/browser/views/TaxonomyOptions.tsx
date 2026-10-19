import type { Messages } from "../controllers/useMessages.ts";

type Taxonomy = { readonly taxonomy: string; readonly entries: readonly { readonly id: string }[] };

type TaxonomyOptionsProps = { readonly messages: Messages; readonly taxonomy: Taxonomy };

export function TaxonomyOptions({ messages, taxonomy }: TaxonomyOptionsProps) {
  return (
    <>
      {taxonomy.entries.map((entry) => (
        <option key={entry.id} value={entry.id}>
          {messages.displayName(taxonomy.taxonomy, entry.id)}
        </option>
      ))}
    </>
  );
}
