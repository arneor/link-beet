import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Store,
  Phone,
  MapPin,
  Building2,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authApi, businessApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Validation schema for business details
const signupSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Validation schema for OTP
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type SignupValues = z.infer<typeof signupSchema>;
type OtpValues = z.infer<typeof otpSchema>;

type Step = "details" | "otp" | "success";

export default function Signup() {
  const [, setNavLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("details");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [signupData, setSignupData] = useState<SignupValues | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  // Form for details
  const detailsForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { businessName: "", location: "", email: "", password: "" },
  });

  // Form for OTP
  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // OTP expiry timer
  useEffect(() => {
    if (otpExpiresIn > 0) {
      const timer = setTimeout(() => setOtpExpiresIn(otpExpiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiresIn]);

  // Handle details submission
  const onSubmitDetails = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      // Signup Request
      const response = await authApi.signup({
        email: data.email,
        password: data.password
      });

      if (response.success) {
        setEmail(data.email);
        setSignupData(data);
        setStep("otp");
        setCountdown(60); // 60 seconds before resend
        setOtpExpiresIn(600); // 10 minutes OTP validity

        toast({
          title: "OTP Sent!",
          description: `Verification code sent to ${data.email}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification and business registration
  const onSubmitOtp = async (data: OtpValues) => {
    setIsLoading(true);
    try {
      // Verify OTP - this also logs the user in and stores the token
      await authApi.verifyOtp(email, data.otp);

      // Now register the business
      if (signupData) {
        const business = await businessApi.register({
          businessName: signupData.businessName,
          location: signupData.location,
          contactEmail: signupData.email,
        });

        // Get the business ID (handle both id and _id from backend)
        const businessId = business.id || (business as any)._id;

        if (!businessId) {
          throw new Error("Business registration failed - no ID returned");
        }

        setStep("success");

        toast({
          title: "Welcome to MarkMorph!",
          description: "Your business account has been created successfully.",
        });

        // Redirect to business dashboard after a short delay
        setTimeout(() => {
          setNavLocation(`/business/${businessId}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Signup OTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP (Call login again, no wait... signup again? 
  // No, if user already created in Step 1, calling signup again might return "Email exists".
  // So I should call LOGIN to resend OTP if user is created but unverified.
  // OR I should use a "resend-otp" endpoint. 
  // But for now, calling login is the trick I used in Login.tsx.
  // If use calls signup again, backend says "Email exists".
  // I'll call `authApi.login({ email, password })` to resend OTP.
  const handleResendOtp = async () => {
    if (countdown > 0 || !signupData) return;

    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: signupData.email,
        password: signupData.password
      });

      if (response.success) {
        setCountdown(60);
        setOtpExpiresIn(600);
        otpForm.reset();

        toast({
          title: "OTP Resent!",
          description: `New verification code sent to ${email}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to details step
  const handleBack = () => {
    setStep("details");
    otpForm.reset();
  };

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-md z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Business Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-display flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    Create your account
                  </CardTitle>
                  <CardDescription>
                    Start setting up your WiFi marketing portal in minutes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...detailsForm}>
                    <form
                      onSubmit={detailsForm.handleSubmit(onSubmitDetails)}
                      className="space-y-4"
                    >
                      {/* Business Name */}
                      <FormField
                        control={detailsForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              Business Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-12"
                                placeholder="The Daily Grind Cafe"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Location */}
                      <FormField
                        control={detailsForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Location
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-12"
                                placeholder="e.g. 123 Main St, New York"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone Number */}


                      {/* Email */}
                      <FormField
                        control={detailsForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-12"
                                type="email"
                                placeholder="business@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password */}
                      <FormField
                        control={detailsForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-12"
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Continue{" "}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <div className="pt-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-auto px-0"
                          onClick={() => setNavLocation("/login")}
                        >
                          Already have an account? Sign in
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-display flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Verify your email
                  </CardTitle>
                  <CardDescription>
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-foreground">
                      {email}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...otpForm}>
                    <form
                      onSubmit={otpForm.handleSubmit(onSubmitOtp)}
                      className="space-y-6"
                    >
                      {/* OTP Input */}
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center">
                            <FormControl>
                              <InputOTP
                                maxLength={6}
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* OTP expiry timer */}
                      {otpExpiresIn > 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                          Code expires in{" "}
                          <span className="font-medium text-primary">
                            {formatTime(otpExpiresIn)}
                          </span>
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        disabled={isLoading || otpForm.watch("otp").length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify & Create Account{" "}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      {/* Resend OTP */}
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-auto"
                          onClick={handleResendOtp}
                          disabled={countdown > 0 || isLoading}
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""
                              }`}
                          />
                          {countdown > 0
                            ? `Resend in ${countdown}s`
                            : "Resend Code"}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="h-auto text-muted-foreground text-sm"
                          onClick={handleBack}
                        >
                          Use a different email
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-semibold mb-2">
                    Account Created!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Welcome to MarkMorph, {signupData?.businessName}!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to setup...
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
