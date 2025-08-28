import Hero from "@/components/home/Hero";
import Faqs from "@/components/home/faqs";
import Pricing from "@/components/home/Pricing";
import FeatureGrid from "@/components/home/FeatureGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <Pricing />
      <Faqs />
    </>
  );
}
