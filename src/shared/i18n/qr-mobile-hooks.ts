import { useMemo } from "react";

import { useI18n, type TranslationParams } from "./index";
import { translateQrMobileError, translateQrMobileText } from "./qr-mobile-translations";

export function useQrMobileTranslations() {
  const { language } = useI18n();

  return useMemo(() => {
    const tq = (key: string, params?: TranslationParams) => translateQrMobileText(language, key, params);
    const functionTitle = (code: string) => tq(`qr.mobile.function.${code}.title`) || tq("qr.mobile.function.unknown.title");
    const functionSubtitle = (code: string) => tq(`qr.mobile.function.${code}.subtitle`) || "";
    const valueLabel = (value?: string | null) => {
      if (!value) return tq("qr.mobile.value.unknown");
      return tq(`qr.mobile.value.${value}`) || tq("qr.mobile.value.unknown");
    };
    const errorLabel = (value?: string | null) => translateQrMobileError(language, value);

    return { language, tq, functionTitle, functionSubtitle, valueLabel, errorLabel };
  }, [language]);
}
