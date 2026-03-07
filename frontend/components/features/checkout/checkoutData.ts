export const PRODUCT = {
  name: "CPHQ Mastery Bundle",
  subtitle: "Full Access + Exam Simulator",
  price: 499,
  reference: "CPHQ-ORDER-9921",
};

export const BANK = {
  name: "Global Healthcare Bank",
  accountHolder: "Yalla CPHQ Learning LTD",
  iban: "AE84 0000 1234 5678 9012 345",
  swift: "GHB UAE 2X",
};

export const STORAGE_KEY = "yalla_checkout_payload_v1";

export type StoredCheckoutPayload = {
  total: number;
  courseTitle: string;
  courseIds: string[];
  discountAmount: number;
  promoCode: string;
};

