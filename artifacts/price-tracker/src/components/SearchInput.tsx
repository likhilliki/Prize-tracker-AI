import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearch: (product: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto relative z-20"
    >
      <div className={cn(
        "relative flex items-center p-2 rounded-2xl glass-panel shadow-lg transition-all duration-300",
        isFocused ? "shadow-primary/20 border-primary/50 ring-4 ring-primary/10 bg-background/90" : "hover:shadow-xl bg-background/60"
      )}>
        <div className="pl-4 pr-2 text-muted-foreground">
          <Search className="w-6 h-6" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="e.g. PlayStation 5 Pro, Dyson Airwrap, iPhone 15..."
          className="flex-1 bg-transparent border-none outline-none text-foreground text-lg md:text-xl placeholder:text-muted-foreground/60 py-4 font-medium"
          disabled={isLoading}
        />
        
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className={cn(
            "flex items-center justify-center h-14 px-8 rounded-xl font-bold text-primary-foreground transition-all duration-300",
            query.trim() && !isLoading
              ? "bg-primary shadow-md shadow-primary/30 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Track Prices
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </button>
      </div>
    </motion.form>
  );
}
