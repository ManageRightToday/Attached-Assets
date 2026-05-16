import React, { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useSearchManagers, getSearchManagersQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ManagerCard from "@/components/ManagerCard";
import PlatformStatsBar from "@/components/PlatformStatsBar";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState<number>(10);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: searchResults, isFetching, refetch } = useSearchManagers(
    { zip, radius: radius as any },
    { query: { enabled: false, queryKey: getSearchManagersQueryKey({ zip, radius: radius as any }) } }
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (zip.length >= 5) {
      setHasSearched(true);
      refetch();
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background text-foreground">
      <PlatformStatsBar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-24 flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-tight">
            Find a Property Manager <br />
            <span className="text-gold italic">You Can Actually Trust</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-sans">
            Authoritative ratings, fee transparency, and verified reviews. 
            The professional terminal for real estate investors.
          </p>

          <form 
            onSubmit={handleSearch}
            className="w-full max-w-2xl mt-8 flex flex-col md:flex-row gap-3 p-2 bg-card rounded-lg border border-border shadow-lg"
          >
            <div className="flex-1 flex items-center px-3 bg-background rounded-md border border-border focus-within:ring-1 focus-within:ring-gold transition-all">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <Input 
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="ZIP Code"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60 h-12"
                maxLength={5}
                data-testid="input-zip"
              />
            </div>
            
            <Select 
              value={radius.toString()} 
              onValueChange={(val) => setRadius(Number(val))}
            >
              <SelectTrigger className="w-full md:w-40 h-12 bg-background border-border text-foreground font-medium" data-testid="select-radius">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Miles</SelectItem>
                <SelectItem value="10">10 Miles</SelectItem>
                <SelectItem value="25">25 Miles</SelectItem>
                <SelectItem value="50">50 Miles</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              type="submit"
              disabled={isFetching || zip.length < 5}
              className="h-12 px-8 bg-gold hover:bg-gold-light text-background font-bold text-lg transition-colors"
              data-testid="button-search"
            >
              {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
              {isFetching ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-6"
            >
              {isFetching ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  <p className="font-serif text-lg">Querying terminal database...</p>
                </div>
              ) : searchResults ? (
                <>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <h2 className="text-2xl font-serif text-foreground">
                      Results for <span className="text-gold">{searchResults.zip}</span>
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                      Showing <span className="text-foreground">{searchResults.freeManagers.length}</span> of {searchResults.total} results
                    </p>
                  </div>
                  
                  {searchResults.total === 0 ? (
                    <div className="py-16 text-center border border-dashed border-border rounded-lg bg-card/50">
                      <p className="text-muted-foreground text-lg">No property managers found in this area.</p>
                      <Button variant="link" onClick={() => setZip("")} className="text-gold mt-2">Try another ZIP code</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {searchResults.freeManagers.map((manager, idx) => (
                        <motion.div
                          key={manager.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <ManagerCard manager={manager} />
                        </motion.div>
                      ))}

                      {searchResults.lockedCount > 0 && (
                        <div className="mt-8 p-6 bg-card border border-gold/20 rounded-lg text-center flex flex-col items-center gap-4">
                          <h3 className="font-serif text-xl text-gold-light">Unlock Premium Insights</h3>
                          <p className="text-muted-foreground max-w-md">
                            {searchResults.lockedCount} additional managers in this area are locked. PropVault members get full access to all data, direct contacts, and historical performance metrics.
                          </p>
                          <Button className="bg-gold hover:bg-gold-light text-background font-bold px-8 mt-2">
                            Become a Member
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
