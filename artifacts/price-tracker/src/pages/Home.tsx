import { AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { usePriceTracker } from "@/hooks/use-price-tracker";
import { Hero } from "@/components/Hero";
import { SearchInput } from "@/components/SearchInput";
import { TrackingProgress } from "@/components/TrackingProgress";
import { ResultsDisplay } from "@/components/ResultsDisplay";

export function Home() {
  const { 
    startTracking, 
    reset, 
    isTracking, 
    hasError, 
    errorMessage, 
    currentProgress, 
    finalResult,
    productQuery
  } = usePriceTracker();

  // Determine which state to show
  const showHero = !isTracking && !finalResult;
  const showProgress = isTracking;
  const showResults = finalResult !== null && !isTracking;

  return (
    <div className="min-h-screen w-full relative selection:bg-primary/30 selection:text-primary">
      {/* Abstract Background */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.85] pointer-events-none bg-cover bg-center mesh-bg"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/abstract-bg.png')` }}
      />
      <div className="fixed inset-0 z-0 bg-background/50 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 min-h-screen flex flex-col">
        
        {/* Navigation / Logo area */}
        <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-between">
          <div 
            onClick={reset}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              PT
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              PriceTracker <span className="text-primary">AI</span>
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {showHero && (
              <div key="hero" className="w-full">
                <Hero />
                <SearchInput onSearch={startTracking} isLoading={isTracking} />
              </div>
            )}

            {showProgress && (
              <div key="progress" className="w-full flex-1 flex flex-col items-center justify-center">
                <TrackingProgress progressMessage={currentProgress} product={productQuery} />
              </div>
            )}

            {showResults && finalResult && (
              <div key="results" className="w-full pb-20">
                <ResultsDisplay data={finalResult} onReset={reset} />
              </div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {hasError && !isTracking && (
              <div key="error" className="w-full max-w-2xl mx-auto mt-8 p-6 glass-panel rounded-2xl border-destructive/20 flex flex-col items-center text-center shadow-lg">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Tracking Failed</h3>
                <p className="text-muted-foreground mb-6">{errorMessage}</p>
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
