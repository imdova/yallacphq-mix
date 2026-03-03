import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CPHQOfferPage() {
  return (
    <div className="container py-12 md:py-16">
      <Link
        href="/offers"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Offers
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
        CPHQ Offer
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-600">
        Limited-time offer on CPHQ exam prep: save on bundles and get extra practice exams. Valid
        for new registrations only.
      </p>
      <div className="mt-8">
        <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Link href="/#enroll">Claim offer</Link>
        </Button>
      </div>
    </div>
  );
}
