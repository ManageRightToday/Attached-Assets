import React from "react";
import { useGetStats } from "@workspace/api-client-react";
import { Building2, Map, ShieldCheck, Star } from "lucide-react";

export default function PlatformStatsBar() {
  const { data: stats } = useGetStats();

  if (!stats) return null;

  return (
    <div className="w-full bg-card border-b border-border py-3 px-4 shadow-sm z-10 relative">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-2 font-serif text-lg font-bold">
          <ShieldCheck className="w-5 h-5 text-gold" />
          <span className="tracking-tight text-foreground">PropVault</span>
        </div>
        
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{stats.totalManagers.toLocaleString()}</strong> Managers
            </span>
          </div>
          
          <div className="w-px h-4 bg-border hidden md:block" />
          
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Map className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{stats.citiesCovered.toLocaleString()}</strong> Cities
            </span>
          </div>

          <div className="w-px h-4 bg-border hidden md:block" />
          
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Star className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{stats.avgTrustScore}</strong> Avg Trust Score
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
