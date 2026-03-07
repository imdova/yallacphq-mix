"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WebinarsPromoSection() {
  return (
    <section
      className="scroll-mt-20 bg-white py-16 md:py-24"
      aria-labelledby="webinars-promo-heading"
    >
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-8 md:p-12 lg:p-16"
        >
          <div
            className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_80%_80%_at_100%_0%,rgba(212,175,55,0.15),transparent)]"
            aria-hidden
          />
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-gold">
              <Calendar className="h-4 w-4" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest">Live sessions</span>
            </div>
            <h2
              id="webinars-promo-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
            >
              Join our <span className="font-serif text-gold">CPHQ webinars</span>
            </h2>
            <p className="mt-4 text-zinc-400">
              Free live sessions with experts. Ask questions, get exam tips, and connect with peers
              preparing for the CPHQ certification.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="inline-flex items-center gap-2 rounded-xl bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
              >
                <Link href="/webinars">
                  <Play className="h-4 w-4" aria-hidden />
                  Watch webinars
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-zinc-600 text-white hover:bg-zinc-800 hover:text-white"
              >
                <Link href="/webinars/cphq-webinar-1" className="inline-flex items-center gap-2">
                  CPHQ Webinar 1
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
