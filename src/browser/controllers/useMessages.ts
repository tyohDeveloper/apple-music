// Resolves the interface and display-name domains (§15.5) for the browser's preferred
// supported language. Locale files are discovered from data/locales/<code>/.
import { useEffect, useMemo } from "preact/hooks";
import languages from "../../../data/locales/languages.json" with { type: "json" };
import { displayNameKey } from "../../localization/displayNameKey.ts";
import { errorMessageKey } from "../../localization/errorMessageKey.ts";
import { fillMessage } from "../../localization/fillMessage.ts";
import { indexCatalogsByLocale } from "../../localization/indexCatalogsByLocale.ts";
import { resolveMessage } from "../../localization/resolveMessage.ts";
import { selectSupportedLocale } from "../../localization/selectSupportedLocale.ts";

type Catalog = Readonly<Record<string, string>>;
type Translate = (key: string, values?: Readonly<Record<string, string>>) => string;
export type Messages = {
  readonly locale: string;
  readonly t: Translate;
  readonly displayName: (taxonomy: string, entryId: string) => string;
  readonly errorMessage: (code: string) => string;
};

const interfaceCatalogs = indexCatalogsByLocale(
  import.meta.glob<Catalog>("../../../data/locales/*/interface.json", { eager: true, import: "default" }),
);
const displayNameCatalogs = indexCatalogsByLocale(
  import.meta.glob<Catalog>("../../../data/locales/*/display-names.json", { eager: true, import: "default" }),
);

function translatorFor(catalogs: Readonly<Record<string, Catalog>>, locale: string): Translate {
  const chain = [catalogs[locale] ?? {}, catalogs[languages.base] ?? {}];
  return (key, values) => fillMessage(resolveMessage(chain, key), values ?? {});
}

function messagesFor(locale: string): Messages {
  const t = translatorFor(interfaceCatalogs, locale);
  const names = translatorFor(displayNameCatalogs, locale);
  return {
    locale,
    t,
    displayName: (taxonomy, entryId) => names(displayNameKey(taxonomy, entryId)),
    errorMessage: (code) => t(errorMessageKey(code)),
  };
}

export function useMessages(): Messages {
  const messages = useMemo(
    () => messagesFor(selectSupportedLocale(navigator.languages, languages.supported, languages.base)),
    [],
  );
  useEffect(() => {
    document.documentElement.lang = messages.locale;
    document.title = messages.t("app.title");
  }, [messages]);
  return messages;
}
