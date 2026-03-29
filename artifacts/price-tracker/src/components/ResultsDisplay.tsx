import { motion } from "framer-motion";
import { ExternalLink, Store, ShoppingBag, ShoppingCart, Tag, AlertCircle, Sparkles, RefreshCcw } from "lucide-react";
import type { TrackResponse, PriceResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn, formatPrice } from "@/lib/utils";

interface ResultsDisplayProps {
  data: TrackResponse;
  onReset: () => void;
}

function SiteIcon({ site, className }: { site: string, className?: string }) {
  const s = site.toLowerCase();
  if (s.includes('amazon')) return <ShoppingBag className={className} />;
  if (s.includes('walmart')) return <Sparkles className={className} />;
  if (s.includes('bestbuy')) return <Tag className={className} />;
  if (s.includes('flipkart')) return <ShoppingCart className={className} />;
  return <Store className={className} />;
}

function getSiteColor(site: string) {
  const s = site.toLowerCase();
  if (s.includes('amazon')) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
  if (s.includes('walmart')) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (s.includes('bestbuy')) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  if (s.includes('flipkart')) return "bg-blue-600/10 text-blue-700 border-blue-600/20";
  return "bg-slate-500/10 text-slate-600 border-slate-500/20";
}

export function ResultsDisplay({ data, onReset }: ResultsDisplayProps) {
  const { product, results, bestDeal } = data;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-5xl mx-auto mt-12 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Results for</h2>
          <h3 className="text-3xl font-bold text-foreground">{product}</h3>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          New Search
        </button>
      </div>

      {/* BEST DEAL CARD */}
      {bestDeal && !bestDeal.error && (
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-1 shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <div className="relative bg-card/95 backdrop-blur-xl rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-white/10">
              
              {/* Badge & Icon */}
              <div className="flex flex-col items-center text-center md:items-start md:text-left min-w-[200px]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 text-white font-bold text-xs uppercase tracking-wide shadow-lg mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Absolute Best Deal
                </div>
                <div className={cn("inline-flex items-center gap-3 px-4 py-2 rounded-xl border font-bold text-lg", getSiteColor(bestDeal.site))}>
                  <SiteIcon site={bestDeal.site} className="w-5 h-5" />
                  {bestDeal.site}
                </div>
              </div>

              {/* Title & Price */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <h4 className="text-xl md:text-2xl font-bold text-foreground line-clamp-2 leading-tight mb-2">
                  {bestDeal.title}
                </h4>
                <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">
                  {formatPrice(bestDeal.price)}
                </p>
              </div>

              {/* Action */}
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <a 
                  href={bestDeal.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold text-lg transition-transform hover:-translate-y-1 active:translate-y-0 shadow-xl"
                >
                  Buy Now
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ALL RESULTS GRID */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((res, i) => (
          <ResultCard 
            key={`${res.site}-${i}`} 
            result={res} 
            isBest={bestDeal?.site === res.site && bestDeal?.price === res.price} 
          />
        ))}
      </motion.div>

    </motion.div>
  );
}

function ResultCard({ result, isBest }: { result: PriceResult, isBest: boolean }) {
  if (result.error) {
    return (
      <div className="flex flex-col justify-center h-full p-6 rounded-2xl bg-card border border-destructive/20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-destructive/50" />
        <div className="flex items-center justify-between mb-4">
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm", getSiteColor(result.site))}>
            <SiteIcon site={result.site} className="w-4 h-4" />
            {result.site}
          </div>
          <AlertCircle className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-muted-foreground font-medium text-sm">Failed to extract price data.</p>
        <p className="text-xs text-muted-foreground/60 mt-2 font-mono bg-muted p-2 rounded">{result.error}</p>
      </div>
    );
  }

  return (
    <a 
      href={result.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "flex flex-col justify-between h-full p-6 rounded-2xl bg-card border shadow-sm transition-all duration-300 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1",
        isBest ? "border-primary/30 ring-1 ring-primary/20" : "border-border hover:border-primary/40"
      )}
    >
      {isBest && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
          BEST DEAL
        </div>
      )}
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm", getSiteColor(result.site))}>
            <SiteIcon site={result.site} className="w-4 h-4" />
            {result.site}
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        
        <h4 className="text-foreground font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {result.title}
        </h4>
      </div>
      
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Found Price</p>
          <p className="text-3xl font-extrabold text-foreground">{formatPrice(result.price)}</p>
        </div>
      </div>
    </a>
  );
}
