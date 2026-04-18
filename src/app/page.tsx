import HeroScroll from "@/components/HeroScroll";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero Section */}
      <HeroScroll />

      {/* Placeholder content below hero to demonstrate that the user can scroll past */}
      <section className="h-screen bg-[#050505] flex items-center justify-center border-t border-[#B7FF00]/10">
        <div className="text-center px-6">
          <p className="text-[#B7FF00]/40 font-mono text-xs md:text-sm tracking-widest uppercase mb-4">
            Contenido de aterrizaje
          </p>
          <div className="w-16 h-[1px] bg-[#B7FF00]/20 mx-auto" />
        </div>
      </section>
    </main>
  );
}
