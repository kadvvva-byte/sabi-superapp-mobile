export type FoodDeliveryLocale = "ru" | "en" | "uz" | "zh";

export type FoodDeliveryTab = "home" | "restaurants" | "cart" | "profile";

export type FoodDeliveryCategoryId =
  | "national_food"
  | "fast_food"
  | "pizza"
  | "asian_food"
  | "grill"
  | "breakfast"
  | "desserts"
  | "drinks"
  | "healthy"
  | "coffee"
  | "bakery"
  | "late_night";

export type FoodDeliveryPhotoKey =
  | "hero_food"
  | "restaurant_lounge"
  | "national_food"
  | "fast_food"
  | "pizza"
  | "asian_food"
  | "grill"
  | "desserts"
  | "drinks"
  | "healthy"
  | "breakfast"
  | "courier";

export type FoodDeliveryApprovalStatus = "admin_approved" | "merchant_pending" | "documents_required" | "provider_pending";
export type FoodDeliveryPaymentStatus = "coin_ready_preview" | "business_merchant_required" | "provider_pending";
export type FoodDeliveryKitchenStatus = "approved" | "documents_required" | "inspection_pending";

export interface FoodDeliveryCategory {
  id: FoodDeliveryCategoryId;
  titleKey: string;
  subtitleKey: string;
  photoKey: FoodDeliveryPhotoKey;
}

export interface FoodDeliveryMenuItem {
  id: string;
  restaurantId: string;
  categoryId: FoodDeliveryCategoryId;
  titleKey: string;
  descriptionKey: string;
  photoKey: FoodDeliveryPhotoKey;
  priceLabelKey: string;
  prepTimeKey: string;
  optionKeys: string[];
}

export interface FoodDeliveryRestaurant {
  id: string;
  titleKey: string;
  descriptionKey: string;
  areaKey: string;
  distanceKey: string;
  deliveryTimeKey: string;
  ratingLabel: string;
  approvalStatus: FoodDeliveryApprovalStatus;
  paymentStatus: FoodDeliveryPaymentStatus;
  kitchenStatus: FoodDeliveryKitchenStatus;
  categoryIds: FoodDeliveryCategoryId[];
  heroPhotoKey: FoodDeliveryPhotoKey;
  menuItemIds: string[];
  messengerRoute: string;
  streamRoute: string;
}

export interface FoodDeliveryCartLine {
  itemId: string;
  quantity: number;
}

export interface FoodDeliveryOrderGate {
  canPrepareRequest: boolean;
  canPay: boolean;
  canCreateOrder: boolean;
  reasonKey: string;
  requiredKeys: string[];
}

export interface FoodDeliverySearchQuery {
  text?: string;
  categoryId?: FoodDeliveryCategoryId | "all";
  area?: string;
}
