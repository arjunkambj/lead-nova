import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features"; 
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import Testimonials from "@/components/marketing/Testimonial";
import FAQ from "@/components/marketing/FAQ";
import Footer from "@/components/marketing/Footer"; 
import CTA from "@/components/marketing/CTA";

export default function Home() {
  return (
    <section className="items-center  relative flex flex-col">
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
