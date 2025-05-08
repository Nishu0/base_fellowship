import How from "@/components/How";
import FeaturesShowcase from "@/components/FeaturesShowcase";
import DeveloperHeatmap from "@/components/DeveloperHeatmap";
import ScoreCalculation from "@/components/ScoreCalculation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="flex flex-col relative bg-black">
      {/* Hero Section - Full viewport height */}
      <Header />

      <ScoreCalculation />
      {/* How section - appears when scrolling */}
      <How />

      {/* Features showcase section */}
      {/* <FeaturesShowcase /> */}

      {/* Developer heatmap section */}
      {/* <DeveloperHeatmap /> */}

      {/* Score calculation section */}
      {/* <ScoreCalculation /> */}

      {/* Footer */}
      <Footer />
    </main>
  );
}
