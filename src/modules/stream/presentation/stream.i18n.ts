import { createStreamMobileTranslator, type StreamLabelKey } from "../../../shared/i18n/stream-mobile-translations";

export type { StreamLabelKey } from "../../../shared/i18n/stream-mobile-translations";

export function createStreamTranslator(language?: string | null) {
  return createStreamMobileTranslator(language);
}
