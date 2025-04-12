
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, trend }: StatsCardProps) => {
  // Format value as rupees if it's a number
  const formattedValue = typeof value === 'number' 
    ? `₹${value.toLocaleString('en-IN')}` 
    : value;
    
  // Animation state for gradient
  const [gradientPosition, setGradientPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const gradientStyle = {
    backgroundPosition: `${gradientPosition}% 50%`,
  };

  return (
    <div 
      className="glass-card p-6 transition-all duration-500 hover:translate-y-[-8px] hover:shadow-xl bg-gradient-to-r from-accent/40 via-primary/10 to-accent/40 hover:bg-gradient-to-r hover:from-primary/20 hover:via-accent/40 hover:to-primary/20 bg-[length:200%_200%] group relative overflow-hidden"
      style={gradientStyle}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic spotlight effect that follows cursor */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
        }}
      />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground mb-1 group-hover:text-foreground/80 transition-colors duration-500">{title}</p>
          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-500">{formattedValue}</h3>
          {trend && (
            <p className={`text-xs flex items-center mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'} group-hover:scale-110 transition-transform duration-500`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      {/* Subtle pulse animation on the card */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-primary/5 animate-pulse-slow -z-10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
              animation: 'float-up 2.5s ease-in-out infinite'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
