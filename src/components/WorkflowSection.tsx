
import { ArrowRight, FileText, FileUp, Search, FileCheck } from "lucide-react";
import { useState } from "react";

const WorkflowSection = () => {
  const [activeStep, setActiveStep] = useState(-1);

  const steps = [
    {
      title: "Upload Bill",
      description: "Upload or scan your bill using our intuitive interface",
      icon: FileUp,
    },
    {
      title: "AI Analysis",
      description: "Our AI extracts all relevant information automatically",
      icon: Search,
    },
    {
      title: "Review & Confirm",
      description: "Verify the extracted data and make any necessary adjustments",
      icon: FileText,
    },
    {
      title: "Process & Store",
      description: "Save to your history and export to your preferred format",
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-16 bg-muted/50 relative overflow-hidden">
      {/* Background subtle patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
      
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-text-shimmer">How It Works</span>
          </h2>
          <p className="text-muted-foreground">
            Our streamlined process makes bill processing faster and more accurate than ever before
          </p>
        </div>
        
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center hover-lift"
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(-1)}
              >
                <div className="relative mb-6">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-500 ${
                      activeStep === index 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 scale-110 shadow-lg shadow-primary/30' 
                        : 'bg-gradient-to-br from-purple-500 to-blue-500'
                    }`}
                  >
                    <step.icon className={`h-7 w-7 transition-transform duration-500 ${activeStep === index ? 'scale-110' : ''}`} />
                    
                    {/* Ripple effect when active */}
                    {activeStep === index && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-primary/30 z-0"></div>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight 
                      className={`hidden md:block absolute -right-16 top-1/2 transform -translate-y-1/2 h-8 w-8 transition-all duration-300 ${
                        activeStep === index || activeStep === index + 1 
                          ? 'text-primary/70 scale-125' 
                          : 'text-primary/30'
                      }`} 
                    />
                  )}
                </div>
                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${activeStep === index ? 'text-primary' : ''}`}>{step.title}</h3>
                <p className={`text-muted-foreground transition-all duration-300 ${activeStep === index ? 'text-foreground' : ''}`}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
