import {
  HomeHeader,
  Hero,
  StatsSection,
  CoursesSection,
  WhyChooseSection,
  WebinarsPromoSection,
  TestimonialSection,
  CTASection,
  HomeFooter,
} from "@/components/features/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black font-home">
      <HomeHeader />
      <main>
        <Hero />
        <StatsSection />
        <CoursesSection />
        <WhyChooseSection />
        <WebinarsPromoSection />
        <TestimonialSection />
        <CTASection />
        <HomeFooter />
      </main>
    </div>
  );
}
