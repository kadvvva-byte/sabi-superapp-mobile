import type { SupportedLanguageCode } from "../../data/languages";
import type { LocaleTree } from "./loader";

export { deepMergeLocale, loadLocaleTree, type LocaleTree } from "./loader";

// Compatibility export only. Runtime i18n must not statically import all locale
// files here, because that was the source of the startup/export overload.
// Use loadLocaleTree(language) to load exactly the selected language on demand.
export const LOCALES = {} as Partial<Record<SupportedLanguageCode, LocaleTree>>;

export default LOCALES;
