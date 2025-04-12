
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WorkflowSection from "@/components/WorkflowSection";
import Footer from "@/components/Footer";
import { Clock, Receipt } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { useEffect, useState } from "react";

const Index = () => {
  // State for cursor follower
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Cursor follower element */}
      <div 
        className="fixed w-64 h-64 rounded-full pointer-events-none z-0 opacity-40 mix-blend-multiply transition-transform duration-1000"
        style={{
          background: "radial-gradient(circle, rgba(123,90,224,0.6) 0%, rgba(94,144,233,0.2) 70%, transparent 100%)",
          transform: `translate(${mousePosition.x - 128}px, ${mousePosition.y - 128}px) scale(${isHovering ? 1.2 : 1})`,
          opacity: isHovering ? 0.6 : 0.3,
          transition: "transform 0.2s ease-out, opacity 0.3s ease-out",
        }}
      />
      
      <Navbar />
      
      <main className="flex-grow relative z-10">
        <HeroSection />
        
        <section className="py-16 gradient-bg relative overflow-hidden">
          {/* Enhanced animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-primary/5 rounded-full filter blur-2xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-secondary/5 rounded-full filter blur-2xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-text-shimmer">What Our AI Can Do</span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 to-secondary/70 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></div>
              </h2>
              <p className="text-muted-foreground">
                Powered by advanced Gemini AI to make bill processing effortless
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto max-w-2xl">
              <StatsCard
                title="Average Time Savings"
                value="85%"
                icon={Clock}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Accuracy Rate"
                value="99.2%"
                icon={Receipt}
                trend={{ value: 3, isPositive: true }}
              />
            </div>
          </div>
        </section>
        
        <WorkflowSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
