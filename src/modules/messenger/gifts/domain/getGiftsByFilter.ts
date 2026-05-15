import { gifts } from "../data/gifts";
import { Gift, GiftCategory, GiftTier } from "../types";

export type GiftCategoryFilter = GiftCategory | "all";
export type GiftTierFilter = GiftTier | "all";

type Params = {
  category: GiftCategoryFilter;
  tier: GiftTierFilter;
};

export function getGiftsByFilter(params: Params): Gift[] {
  return gifts.filter((gift) => {
    const categoryOk =
      params.category === "all" || gift.category === params.category;

    const tierOk = params.tier === "all" || gift.tier === params.tier;

    return categoryOk && tierOk;
  });
}