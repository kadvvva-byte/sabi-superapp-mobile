import { FOOD_DELIVERY_CATEGORIES, FOOD_DELIVERY_MENU_ITEMS, FOOD_DELIVERY_RESTAURANTS } from "../data/foodDelivery.local";
import type { FoodDeliveryCartLine, FoodDeliveryCategoryId, FoodDeliveryMenuItem, FoodDeliveryOrderGate, FoodDeliveryRestaurant, FoodDeliverySearchQuery } from "../domain/foodDelivery.types";

export function getFoodDeliveryCategories() {
  return FOOD_DELIVERY_CATEGORIES;
}

export function getFoodDeliveryRestaurants() {
  return FOOD_DELIVERY_RESTAURANTS;
}

export function getFoodDeliveryMenuItems() {
  return FOOD_DELIVERY_MENU_ITEMS;
}

export function findFoodDeliveryRestaurant(id?: string | null): FoodDeliveryRestaurant | null {
  if (!id) return null;
  return FOOD_DELIVERY_RESTAURANTS.find((restaurant) => restaurant.id === id) ?? null;
}

export function findFoodDeliveryItem(id?: string | null): FoodDeliveryMenuItem | null {
  if (!id) return null;
  return FOOD_DELIVERY_MENU_ITEMS.find((item) => item.id === id) ?? null;
}

export function itemsForRestaurant(restaurant: FoodDeliveryRestaurant | null | undefined) {
  if (!restaurant) return [];
  const ids = new Set(restaurant.menuItemIds);
  return FOOD_DELIVERY_MENU_ITEMS.filter((item) => ids.has(item.id));
}

export function searchFoodDeliveryRestaurants(query: FoodDeliverySearchQuery) {
  const normalizedText = String(query.text || "").trim().toLowerCase();
  const categoryId = query.categoryId || "all";

  return FOOD_DELIVERY_RESTAURANTS.filter((restaurant) => {
    const categoryOk = categoryId === "all" || restaurant.categoryIds.includes(categoryId as FoodDeliveryCategoryId);
    if (!categoryOk) return false;
    if (!normalizedText) return true;

    const searchable = [restaurant.titleKey, restaurant.descriptionKey, restaurant.areaKey, restaurant.categoryIds.join(" ")].join(" ").toLowerCase();
    return searchable.includes(normalizedText);
  });
}

export function searchFoodDeliveryItems(query: FoodDeliverySearchQuery) {
  const normalizedText = String(query.text || "").trim().toLowerCase();
  const categoryId = query.categoryId || "all";

  return FOOD_DELIVERY_MENU_ITEMS.filter((item) => {
    const categoryOk = categoryId === "all" || item.categoryId === categoryId;
    if (!categoryOk) return false;
    if (!normalizedText) return true;

    const restaurant = findFoodDeliveryRestaurant(item.restaurantId);
    const searchable = [item.titleKey, item.descriptionKey, item.categoryId, restaurant?.titleKey].join(" ").toLowerCase();
    return searchable.includes(normalizedText);
  });
}

export function buildFoodDeliveryOrderGate(restaurant: FoodDeliveryRestaurant | null | undefined): FoodDeliveryOrderGate {
  if (!restaurant) {
    return { canPrepareRequest: false, canPay: false, canCreateOrder: false, reasonKey: "gate.noRestaurant", requiredKeys: ["gate.restaurant"] };
  }

  const requiredKeys = ["gate.kyc", "gate.businessMerchant", "gate.foodDocs", "gate.adminApproval", "gate.courierProvider"];

  if (restaurant.approvalStatus !== "admin_approved") {
    return { canPrepareRequest: true, canPay: false, canCreateOrder: false, reasonKey: "gate.adminPending", requiredKeys };
  }

  if (restaurant.paymentStatus !== "coin_ready_preview") {
    return { canPrepareRequest: true, canPay: false, canCreateOrder: false, reasonKey: "gate.paymentPending", requiredKeys };
  }

  return { canPrepareRequest: true, canPay: false, canCreateOrder: false, reasonKey: "gate.noFakeOrder", requiredKeys };
}

export function countCartItems(lines: FoodDeliveryCartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartPreviewLines(lines: FoodDeliveryCartLine[]) {
  return lines
    .map((line) => {
      const item = findFoodDeliveryItem(line.itemId);
      const restaurant = findFoodDeliveryRestaurant(item?.restaurantId);
      return item ? { item, restaurant, quantity: line.quantity } : null;
    })
    .filter(Boolean) as Array<{ item: FoodDeliveryMenuItem; restaurant: FoodDeliveryRestaurant | null; quantity: number }>;
}
