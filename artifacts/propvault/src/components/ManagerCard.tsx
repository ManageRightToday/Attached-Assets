import React from "react";
import { Star, ShieldAlert, Award, Lock, FileText, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { Manager } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ManagerCard({ manager }: { manager: Manager }) {
  const isGreen = manager.score >= 85;
  const isGold = manager.score >= 70 && manager.score < 85;
  const scoreColor = isGreen ? "bg-status-green" : isGold ? "bg-gold" : "bg-status-red";
  const scoreText = isGreen ? "text-status-green" : isGold ? "text-gold" : "text-status-red";

  const googleColor = manager.googleRating >= 4.5 ? "text-status-green" : manager.googleRating >= 4.0 ? "text-gold" : "text-status-red";
  const bbbColor = ["A+", "A"].includes(manager.bbbRating) ? "text-status-green" : manager.bbbRating === "B+" ? "text-gold" : "text-status-red";

  return (
    <div className={`relative w-full rounded-lg border bg-card p-6 shadow-sm overflow-hidden group transition-all duration-300 hover:border-gold/30 ${manager.locked ? 'border-border' : 'border-border'}`}>
      {manager.locked && (
        <div className="absolute inset-0 z-20 backdrop-blur-md bg-background/40 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-card border border-gold/30 flex items-center justify-center mb-4 shadow-xl">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Premium Manager Locked</h3>
          <p className="text-muted-foreground max-w-md mb-6 font-sans">
            This top-tier property manager is reserved for PropVault members. Unlock their full profile, contact info, and detailed history.
          </p>
          <Button className="bg-gold hover:bg-gold-light text-background font-bold px-8 shadow-lg shadow-gold/20" data-testid={`btn-unlock-${manager.id}`}>
            Unlock Full Report
          </Button>
        </div>
      )}

      <div className={`flex flex-col md:flex-row gap-6 ${manager.locked ? 'opacity-30 pointer-events-none blur-[2px]' : ''}`}>
        
        {/* Left Col: Avatar & Score */}
        <div className="flex flex-col items-center gap-4 min-w-[140px]">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg bg-secondary border border-border flex items-center justify-center shadow-inner">
              <span className="font-serif text-4xl text-foreground/80">{manager.name.charAt(0)}</span>
            </div>
            {manager.rank <= 2 && (
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-background font-bold text-sm shadow-md border border-gold-light">
                #{manager.rank}
              </div>
            )}
            {manager.rank > 2 && (
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-card border border-gold text-gold flex items-center justify-center font-bold text-sm">
                #{manager.rank}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center w-full">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Trust Score</span>
            <div className="flex items-end gap-1">
              <span className={`font-serif text-4xl leading-none ${scoreText}`}>{manager.score}</span>
              <span className="text-muted-foreground text-sm font-medium pb-1">/100</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div className={`h-full ${scoreColor} rounded-full`} style={{ width: `${manager.score}%` }} />
            </div>
          </div>
        </div>

        {/* Mid Col: Details & Metrics */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">{manager.name}</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 opacity-70" />
              {manager.city} • {manager.yearsInBusiness} Years in Business
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-background border border-border rounded-md p-3 flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Google Rating</span>
              <div className="flex items-center gap-1.5">
                <Star className={`w-4 h-4 fill-current ${googleColor}`} />
                <span className={`font-bold text-lg ${googleColor}`}>{manager.googleRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({manager.googleReviewCount})</span>
              </div>
            </div>
            <div className="bg-background border border-border rounded-md p-3 flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">BBB Rating</span>
              <div className="flex items-center gap-1.5">
                <Award className={`w-4 h-4 ${bbbColor}`} />
                <span className={`font-bold text-lg ${bbbColor}`}>{manager.bbbRating}</span>
              </div>
            </div>
            <div className="bg-background border border-border rounded-md p-3 flex flex-col gap-1 col-span-2 md:col-span-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Management Fee</span>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-foreground/70" />
                <span className="font-bold text-lg text-foreground">
                  {manager.feePercent ? `${manager.feePercent}%` : "Undisclosed"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {manager.feeTransparent ? (
              <Badge variant="outline" className="bg-status-green/10 text-status-green border-status-green/20 font-medium py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Transparent Fees
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-status-red/10 text-status-red border-status-red/20 font-medium py-1">
                <AlertCircle className="w-3 h-3 mr-1" /> Fees Not Listed
              </Badge>
            )}
            
            {manager.bbbComplaints === 0 ? (
              <Badge variant="outline" className="bg-status-green/10 text-status-green border-status-green/20 font-medium py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Zero BBB Complaints
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-status-red/10 text-status-red border-status-red/20 font-medium py-1">
                <ShieldAlert className="w-3 h-3 mr-1" /> {manager.bbbComplaints} Complaints
              </Badge>
            )}

            {manager.specialties.map(spec => (
              <Badge key={spec} variant="outline" className="bg-gold/10 text-gold border-gold/20 font-medium py-1">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
