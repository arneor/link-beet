import { useParams, useLocation } from "wouter";
import { SplashCarousel } from "@/components/SplashCarousel";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wifi, Loader2, MapPin, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConnectWifi, useSplashData } from "@/hooks/use-splash";

export default function Splash() {
  const { businessId } = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(businessId || "0");
  const { toast } = useToast();
  const [connectStep, setConnectStep] = useState<
    "idle" | "connecting" | "success"
  >("idle");

  const { data, isLoading, error } = useSplashData(id);
  const connectMutation = useConnectWifi();

  const business = data?.business;
  const campaigns = (data?.campaigns || []).filter((c) => c.isActive);

  const handleConnect = () => {
    if (connectStep !== "idle") return;
    setConnectStep("connecting");

    connectMutation.mutate(
      { businessId: id, deviceType: "mobile" },
      {
        onSuccess: (res) => {
          setConnectStep("success");
          setTimeout(() => {
            if (res.redirectUrl) {
              window.location.href = res.redirectUrl;
              return;
            }
            toast({
              title: "Connected!",
              description: "You are now online.",
            });
            setLocation("/");
          }, 900);
        },
        onError: () => {
          setConnectStep("idle");
          toast({
            title: "Connection Failed",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleReview = () => {
    window.open(
      "https://www.google.com/search?q=coffee+shop+reviews",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Mobile container - max width constraints */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
              Loading…
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-3">
              <div className="text-lg font-semibold text-gray-900">
                Unable to load
              </div>
              <div className="text-sm text-muted-foreground">
                {error.message || "Please check the link and try again."}
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && business && (
          <>
            {/* Header / Brand Area */}
            <div className="px-6 pt-12 pb-6 text-center space-y-4 bg-gradient-to-b from-white to-gray-50">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-inner">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Wifi className="w-10 h-10 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">
                  {business.name}
                </h1>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{business.address || "Free Guest WiFi"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    Free WiFi
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {campaigns.length} offers today
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area (Ads-first) */}
            <div className="flex-1 px-4 pb-40 space-y-4">
              <div className="pt-2">
                <SplashCarousel campaigns={campaigns as any} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {campaigns.slice(0, 4).map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border bg-muted"
                  >
                    <div className="aspect-[4/5]">
                      <img
                        src={c.contentUrl}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="text-white font-semibold text-sm leading-snug">
                        {c.title}
                      </div>
                      <div className="text-white/80 text-xs">Sponsored</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom Action Bar (2 actions only) */}
            <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur border-t p-4">
              <div className="space-y-3">
                <Button
                  onClick={handleConnect}
                  className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  style={{
                    backgroundColor: business.primaryColor || undefined,
                  }}
                  disabled={connectStep !== "idle"}
                >
                  {connectStep === "idle" && "Connect to WiFi"}
                  {connectStep === "connecting" && (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
                    </span>
                  )}
                  {connectStep === "success" && "Connected"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  onClick={handleReview}
                >
                  Leave a Google Review
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center text-[11px] text-gray-400">
                  Powered by MarkMorph
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
