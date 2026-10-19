// Turns locale files keyed by path (…/locales/<code>/<domain>.json) into catalogs keyed
// by locale code, so adding a language means adding files only (§15.2).
type Catalog = Readonly<Record<string, string>>;

export function indexCatalogsByLocale(files: Readonly<Record<string, Catalog>>): Readonly<Record<string, Catalog>> {
  const byLocale: Record<string, Catalog> = {};
  for (const [path, catalog] of Object.entries(files)) {
    const segments = path.split("/");
    const locale = segments[segments.length - 2];
    if (locale !== undefined) byLocale[locale] = catalog;
  }
  return byLocale;
}
