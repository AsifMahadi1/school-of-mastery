import Navbar from "@/components/Navbar";
import FloatingContact from "@/components/FloatingContact";
import Hero from "@/components/Hero";
import VideoStrip from "@/components/sections/VideoStrip";
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
      <FloatingContact />
      <main>
        <Hero />
        <VideoStrip />
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
