import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OFFERS_DROPDOWN_ITEMS } from "@/constants";
import { ChevronRight } from "lucide-react";

export default function OffersPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white">
        <div className="container py-12 md:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">Offers</h1>
          <p className="mt-2 text-zinc-600">
            Special offers and resources to support your CPHQ journey.
          </p>
        </div>
      </div>
      <div className="container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS_DROPDOWN_ITEMS.map(({ href, label }) => (
            <Card key={href} className="border-zinc-200 transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{label}</CardTitle>
                <CardDescription>
                  {label === "Start your journey today" &&
                    "Register for the CPHQ preparation program."}
                  {label === "CPHQ Free Lecture" && "Watch a free introductory CPHQ lecture."}
                  {label === "CPHQ Offer" && "Limited-time offer on CPHQ exam prep."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href={href}>
                    View details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
