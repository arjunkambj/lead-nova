import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { Testimonials } from "@/components/marketing/Testimonials";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { CTA } from "@/components/marketing/CTA";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <section className="items-center relative flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </section>
  );
}
