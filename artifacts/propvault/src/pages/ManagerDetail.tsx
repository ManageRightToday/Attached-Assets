import { useParams, Link } from "wouter";
import { useGetManager, getGetManagerQueryKey } from "@workspace/api-client-react";
import { Loader2, MapPin, Star, ShieldAlert, Award, FileText, CheckCircle2, AlertCircle, Phone, Globe, ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ManagerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: manager, isLoading, isError } = useGetManager(id || "", {
    query: { queryKey: getGetManagerQueryKey(id || "") }
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="font-serif text-lg">Loading manager profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !manager) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-status-red" />
        <h2 className="text-2xl font-serif text-foreground">Failed to load profile</h2>
        <Link href="/" className="text-gold hover:underline mt-4">
          Return to search
        </Link>
      </div>
    );
  }

  const isGreen = manager.score >= 85;
  const isGold = manager.score >= 70 && manager.score < 85;
  const scoreColor = isGreen ? "bg-status-green" : isGold ? "bg-gold" : "bg-status-red";
  const scoreText = isGreen ? "text-status-green" : isGold ? "text-gold" : "text-status-red";

  const googleColor = manager.googleRating >= 4.5 ? "text-status-green" : manager.googleRating >= 4.0 ? "text-gold" : "text-status-red";
  const bbbColor = ["A+", "A"].includes(manager.bbbRating) ? "text-status-green" : manager.bbbRating === "B+" ? "text-gold" : "text-status-red";

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground pb-24">
      {/* Top Nav */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to results
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">
        
        {/* Header Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-6 items-start md:items-center"
        >
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg">
              <span className="font-serif text-5xl md:text-6xl text-foreground/90">{manager.name.charAt(0)}</span>
            </div>
            {manager.rank <= 2 ? (
              <div className="absolute -bottom-4 -right-2 w-10 h-10 rounded-full bg-gold flex items-center justify-center text-background font-bold text-sm shadow-md border-2 border-background">
                #{manager.rank}
              </div>
            ) : (
              <div className="absolute -bottom-4 -right-2 w-10 h-10 rounded-full bg-card flex items-center justify-center text-gold font-bold text-sm shadow-md border-2 border-background">
                #{manager.rank}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">{manager.name}</h1>
              {manager.openNow !== null && (
                <Badge variant="outline" className={`${manager.openNow ? 'bg-status-green/10 text-status-green border-status-green/20' : 'bg-status-red/10 text-status-red border-status-red/20'} font-medium`}>
                  {manager.openNow ? 'Open Now' : 'Closed'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground gap-1.5">
              <MapPin className="w-4 h-4 opacity-70" />
              <span className="text-base">{manager.address ? `${manager.address}, ${manager.city}` : manager.city}</span>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 bg-card p-4 rounded-lg border border-border shadow-sm">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Trust Score</span>
            <div className="flex items-end gap-1">
              <span className={`font-serif text-5xl leading-none ${scoreText}`}>{manager.score}</span>
              <span className="text-muted-foreground font-medium pb-1">/100</span>
            </div>
          </div>
        </motion.section>

        {/* Contact Strip */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          {manager.phone && (
            <a href={`tel:${manager.phone}`} data-testid="link-phone">
              <Button variant="outline" className="bg-card hover:bg-secondary hover:text-foreground border-border text-foreground transition-colors h-11 px-5">
                <Phone className="w-4 h-4 mr-2" />
                {manager.phone}
              </Button>
            </a>
          )}
          {manager.website && (
            <a href={manager.website} target="_blank" rel="noopener noreferrer" data-testid="link-website">
              <Button variant="outline" className="bg-card hover:bg-secondary hover:text-foreground border-border text-foreground transition-colors h-11 px-5">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </Button>
            </a>
          )}
          {manager.googleMapsUrl && (
            <a href={manager.googleMapsUrl} target="_blank" rel="noopener noreferrer" data-testid="link-maps">
              <Button variant="outline" className="bg-card hover:bg-secondary hover:text-foreground border-border text-foreground transition-colors h-11 px-5">
                <MapPin className="w-4 h-4 mr-2" />
                Google Maps
              </Button>
            </a>
          )}
        </motion.section>

        {/* Trust Score Breakdown */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-5 p-6 md:p-8 bg-card rounded-xl border border-border shadow-sm"
        >
          <h2 className="text-xl font-serif font-bold border-b border-border pb-4">Performance Breakdown</h2>
          
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full ${scoreColor} rounded-full`} style={{ width: `${manager.score}%` }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="bg-background border border-border rounded-lg p-5 flex flex-col gap-2 shadow-sm">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Google Rating</span>
              <div className="flex items-center gap-2 mt-auto">
                <Star className={`w-6 h-6 fill-current ${googleColor}`} />
                <span className={`font-bold text-3xl ${googleColor}`}>{manager.googleRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground font-medium pt-1">({manager.googleReviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-5 flex flex-col gap-2 shadow-sm">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">BBB Rating</span>
              <div className="flex items-center gap-2 mt-auto">
                <Award className={`w-6 h-6 ${bbbColor}`} />
                <span className={`font-bold text-3xl ${bbbColor}`}>{manager.bbbRating}</span>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-5 flex flex-col gap-2 shadow-sm">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Management Fee</span>
              <div className="flex items-center gap-2 mt-auto">
                <FileText className="w-6 h-6 text-foreground/70" />
                <span className="font-bold text-3xl text-foreground">
                  {manager.feePercent ? `${manager.feePercent}%` : "Undisclosed"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-border/50">
            {manager.feeTransparent ? (
              <Badge variant="outline" className="bg-status-green/10 text-status-green border-status-green/20 font-medium py-1.5 px-3">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Transparent Fees
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-status-red/10 text-status-red border-status-red/20 font-medium py-1.5 px-3">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Fees Not Listed
              </Badge>
            )}
            
            {manager.bbbComplaints === 0 ? (
              <Badge variant="outline" className="bg-status-green/10 text-status-green border-status-green/20 font-medium py-1.5 px-3">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Zero BBB Complaints
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-status-red/10 text-status-red border-status-red/20 font-medium py-1.5 px-3">
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> {manager.bbbComplaints} Complaints
              </Badge>
            )}

            <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border font-medium py-1.5 px-3">
              <Clock className="w-3.5 h-3.5 mr-1.5" /> {manager.yearsInBusiness} Years Active
            </Badge>

            {manager.specialties.map(spec => (
              <Badge key={spec} variant="outline" className="bg-gold/10 text-gold border-gold/20 font-medium py-1.5 px-3">
                {spec}
              </Badge>
            ))}
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-8">
            {/* About Section */}
            {manager.about && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-2xl font-serif font-bold text-foreground">About</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {manager.about}
                </div>
              </motion.section>
            )}

            {/* Google Reviews */}
            {manager.reviews && manager.reviews.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-6 pt-4"
              >
                <h2 className="text-2xl font-serif font-bold text-foreground">What clients say</h2>
                <div className="flex flex-col gap-4">
                  {manager.reviews.slice(0, 5).map((review, idx) => {
                    const reviewColor = review.rating >= 4.5 ? "text-status-green" : review.rating >= 4 ? "text-gold" : "text-status-red";
                    return (
                      <div key={idx} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{review.authorName}</span>
                            <span className="text-xs text-muted-foreground mt-0.5">{review.relativeTime}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0 bg-background px-2 py-1 rounded border border-border">
                            <span className={`font-bold mr-1 ${reviewColor}`}>{review.rating}</span>
                            <Star className={`w-3.5 h-3.5 fill-current ${reviewColor}`} />
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{review.text}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </div>

          <div className="md:col-span-1 flex flex-col gap-8">
            {/* Opening Hours */}
            {manager.openingHours && manager.openingHours.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit"
              >
                <h2 className="text-lg font-serif font-bold border-b border-border pb-3 mb-4">Hours</h2>
                <ul className="flex flex-col gap-3 text-sm">
                  {manager.openingHours.map((line, idx) => {
                    return (
                      <li key={idx} className="flex justify-between items-start border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{line}</span>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground/60 text-center mt-12 border-t border-border pt-8"
        >
          Scores are calculated by PropVault based on publicly available data. Contact info sourced from Google Places.
        </motion.p>

      </main>
    </div>
  );
}
