export const Hero = () => {
  return (
    <section className="flex flex-col items-center h-[90vh] justify-center">
      <MainContent />
      <BrandElement />
    </section>
  );
};

const MainContent = () => {
  return <div>MainContent</div>;
};

const BrandElement = () => {
  return <div>Open AI</div>;
};
