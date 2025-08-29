import FeatureGrid from "@/components/home/FeatureGrid";
import Faqs from "@/components/home/faqs";
import Hero from "@/components/home/Hero";
import Pricing from "@/components/home/Pricing";

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
