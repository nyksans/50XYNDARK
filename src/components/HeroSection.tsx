
import { ArrowRight, FileCheck, FileSearch, PieChart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureCard from "./FeatureCard";

const HeroSection = () => {
  const features = [
    {
      title: "AI Bill Scanning",
      description: "Upload any bill and our AI will automatically extract and categorize the data.",
      icon: FileSearch,
    },
    {
      title: "Smart Templates",
      description: "Create and save templates for recurring bills to speed up future processing.",
      icon: FileCheck,
    },
    {
      title: "Usage Analytics",
      description: "Track your spending patterns with detailed visual reports and insights.",
      icon: PieChart,
    },
    {
      title: "Instant Processing",
      description: "Process bills in seconds, not minutes, with our optimized AI technology.",
      icon: Zap,
    },
  ];

  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Smart Bill Processing</span>
            <br />Powered by AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Automate your bill management workflow with our AI-powered solution. 
            Save time, reduce errors, and gain insights into your expenses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/scan" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/templates" className="bg-muted hover:bg-muted/80 text-foreground font-medium px-6 py-3 rounded-md transition-colors">
              View Templates
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
