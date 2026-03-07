import { CardPaymentView } from "@/components/features/checkout/CardPaymentView";

export const metadata = {
  title: "Card payment | Yalla CPHQ",
  description: "Complete your payment with PayPal or card.",
};

export default function CardPaymentPage() {
  return <CardPaymentView />;
}
