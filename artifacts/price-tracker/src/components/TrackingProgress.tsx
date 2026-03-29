import { motion } from "framer-motion";
import { Loader2, Target, Globe, Server, Bot } from "lucide-react";

interface TrackingProgressProps {
  progressMessage: string;
  product: string;
}

export function TrackingProgress({ progressMessage, product }: TrackingProgressProps) {
  // Extract the current site being checked from the progress message if possible
  const sites = ["amazon", "bestbuy", "walmart", "flipkart"];
  const activeSite = sites.find(s => progressMessage.toLowerCase().includes(s));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto mt-16 p-8 md:p-12 glass-panel rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        
        {/* Pulsing Icon */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-2 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="relative z-10 bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-primary/40">
            <Bot className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">AI Agent Active</h3>
          <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
            Searching the web for <span className="text-foreground font-bold">"{product}"</span>
          </p>
        </div>

        {/* Current Task Display */}
        <div className="w-full max-w-md bg-secondary/50 rounded-2xl p-4 border border-border/50 flex items-center gap-4">
          <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
          <p className="text-sm font-medium text-foreground text-left flex-1">
            {progressMessage}
          </p>
        </div>

        {/* Site Indicators */}
        <div className="flex items-center justify-center gap-4 pt-4 w-full">
          {[
            { id: "amazon", name: "Amazon" },
            { id: "bestbuy", name: "BestBuy" },
            { id: "walmart", name: "Walmart" },
            { id: "flipkart", name: "Flipkart" }
          ].map((site) => {
            const isActive = activeSite === site.id;
            return (
              <div 
                key={site.id}
                className={`flex flex-col items-center gap-2 transition-all duration-500 ${
                  isActive ? "opacity-100 scale-110" : "opacity-40 grayscale"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  isActive ? "bg-background border-primary shadow-lg shadow-primary/20 text-primary" : "bg-muted border-transparent text-muted-foreground"
                }`}>
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">{site.name}</span>
              </div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}
