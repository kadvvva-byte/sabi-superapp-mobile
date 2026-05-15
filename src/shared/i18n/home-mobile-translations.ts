import { useMemo } from "react";

import { useI18n } from "./index";
import {
  HOME_MOBILE_TEXT,
  HOME_MOBILE_TRANSLATIONS,
  normalizeHomeMobileLocale,
  pickHomeMobileText,
  type HomeMobileLocale,
  type HomeMobileText,
} from "./home-mobile-locale-source";

export {
  HOME_MOBILE_TEXT,
  HOME_MOBILE_TRANSLATIONS,
  normalizeHomeMobileLocale,
  pickHomeMobileText,
  type HomeMobileLocale,
  type HomeMobileText,
};

export default HOME_MOBILE_TRANSLATIONS;

export function useHomeMobileText(): HomeMobileText {
  const { language } = useI18n();
  return useMemo(() => pickHomeMobileText(language), [language]);
}

