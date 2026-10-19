// The fields of a submitted form as text, keyed by input name. Views hand submit events
// here unread; mapping values to requests is PURE (src/forms).
export type FormValues = Readonly<Record<string, string>>;

export function formValuesOf(event: SubmitEvent, reset = false): FormValues {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const values: Record<string, string> = {};
  for (const [name, value] of new FormData(form)) values[name] = typeof value === "string" ? value : value.name;
  if (reset) form.reset();
  return values;
}
