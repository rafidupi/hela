import HeroScroll from "@/components/HeroScroll";
import Navbar from "@/components/Navbar";
import ClaritySection from "@/components/ClaritySection";
import ProblemSection from "@/components/ProblemSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero Section */}
      <HeroScroll />

      {/* Section 2: Post-hero clarity statement */}
      <ClaritySection />

      {/* Section 3: The problem */}
      <ProblemSection />
    </main>
  );
}
