import Link from "next/link";
import { Button } from "@/components/ui/button";

const HERO_VIDEO_ID = "9JJYT8ajOKg";

export function Hero() {
  return (
    <section
      className="relative min-h-[85vh] overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-4 py-16 sm:py-20 md:py-24 lg:py-28"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.08),transparent)]"
        aria-hidden
      />
      <div className="container relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="max-w-xl space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            Trusted by healthcare professionals
          </p>
          <h1 className="space-y-1">
            <span className="block text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Master
            </span>
            <span className="block font-serif text-3xl font-semibold text-gold sm:text-4xl md:text-5xl lg:text-6xl">
              Healthcare Quality
            </span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-zinc-300">
            Prepare for the CPHQ exam with programs designed by industry experts. Build the skills
            and confidence to lead quality improvement in your organization.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-gold px-6 py-6 font-semibold text-gold-foreground shadow-lg shadow-gold/20 transition hover:bg-gold/90"
            >
              <Link href="#courses">Explore Courses</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl border-zinc-500 bg-transparent px-6 py-6 font-semibold text-white hover:border-gold/50 hover:bg-gold/10 hover:text-white"
            >
              <Link href="#enroll">Get Started</Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-8 md:block lg:mt-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gold/20 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <iframe
              src={`https://www.youtube.com/embed/${HERO_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Yalla CPHQ – Healthcare Quality"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
