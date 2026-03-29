import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";

export function Hero() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 shadow-sm"
      >
        <Sparkles className="w-4 h-4" />
        <span>AI-Powered Price Comparison</span>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground"
      >
        Find the <span className="text-gradient">Best Deal</span><br />
        in Seconds.
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl"
      >
        Our autonomous web agent scours Amazon, BestBuy, Walmart, and Flipkart to find you the absolute lowest price for any product.
      </motion.p>
    </div>
  );
}
