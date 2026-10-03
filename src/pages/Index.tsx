import Header from "@/components/Header";
import DemoSection from "@/components/DemoSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-12">
        <DemoSection />
      </main>
    </div>
  );
};

export default Index;
