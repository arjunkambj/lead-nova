import Hero from "@/components/home/Hero";
import Faqs from "@/components/home/faqs";
import Footer from "@/components/home/Footer";
import Pricing from "@/components/home/Pricing";
import FeatureGrid from "@/components/home/FeatureGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <Pricing />
      <Faqs />
      <Footer />
    </>
  );
}
