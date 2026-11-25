import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CourseSection from "@/components/sections/CourseSection";
import DetailsSection from "@/components/sections/DetailsSection";
import WatchSection from "@/components/sections/WatchSection";
import EnrollSection from "@/components/sections/EnrollSection";
import FaqSection from "@/components/sections/FaqSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import AboutSection from "@/components/sections/AboutSection";
import SiteFooter from "@/components/sections/SiteFooter";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CourseSection />
        <DetailsSection />
        <WatchSection />
        <EnrollSection />
        <FaqSection />
        <ReviewsSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  );
}
