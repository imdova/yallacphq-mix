import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText } from "lucide-react";

export function CTASection() {
  return (
    <section
      id="enroll"
      className="scroll-mt-20 bg-gradient-to-b from-zinc-900 to-black py-16 md:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="container px-4 text-center md:px-6">
        <h2
          id="cta-heading"
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
        >
          Ready to lead <span className="font-serif text-gold">change?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-zinc-400">
          Take the next step in your healthcare quality journey. Enroll in a program or explore our
          free resources.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-6 font-semibold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
          >
            <Link href="/courses">
              <BookOpen className="h-5 w-5" aria-hidden />
              Browse courses
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="inline-flex items-center gap-2 rounded-xl border-zinc-600 bg-transparent px-8 py-6 font-semibold text-white hover:bg-zinc-800 hover:text-white"
          >
            <Link href="/offers">
              <FileText className="h-5 w-5" aria-hidden />
              Free resources
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
