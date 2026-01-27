import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";

const businessCategories = [
  "Restaurants and cafes",
  "Salons and spas",
  "Gyms and fitness centers",
  "Coffee shops",
  "Retail stores",
  "Hotels and hospitality",
  "Shopping malls",
  "Medical/dental offices",
  "Other",
] as const;

type WizardStep = 1 | 2 | 3 | 4;

const wizardSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  category: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),

  photos: z.string().optional(),
  banners: z.string().optional(),
  videoUrl: z.string().optional(),

  wifiSsid: z.string().optional(),
  wifiSessionDurationMinutes: z.coerce.number().int().optional(),
  bandwidthKbps: z.coerce.number().int().optional(),
  maxConcurrentConnections: z.coerce.number().int().optional(),
  autoReconnect: z.boolean().optional(),

  profileType: z.enum(["private", "public"]).optional(),
});

type WizardValues = z.infer<typeof wizardSchema>;

function parseUrlList(v: string | undefined): string[] | null {
  const list = (v || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

export default function BusinessOnboarding() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const { data: business } = useBusiness(businessId);
  const updateBusiness = useUpdateBusiness();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [step, setStep] = useState<WizardStep>(1);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "",
      category: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
      description: "",
      logoUrl: "",
      primaryColor: "#000000",
      photos: "",
      banners: "",
      videoUrl: "",
      wifiSsid: "",
      wifiSessionDurationMinutes: undefined,
      bandwidthKbps: undefined,
      maxConcurrentConnections: undefined,
      autoReconnect: true,
      profileType: "private",
    },
  });

  useEffect(() => {
    if (!business) return;
    form.reset({
      name: business.name || "",
      category: (business.category as any) || "",
      address: business.address || "",
      contactEmail: (business.contactEmail as any) || "",
      contactPhone: (business.contactPhone as any) || "",
      description: (business.description as any) || "",
      logoUrl: business.logoUrl || "",
      primaryColor: business.primaryColor || "#000000",
      photos: Array.isArray((business as any).photos)
        ? ((business as any).photos as string[]).join("\n")
        : "",
      banners: Array.isArray((business as any).banners)
        ? ((business as any).banners as string[]).join("\n")
        : "",
      videoUrl: (business.videoUrl as any) || "",
      wifiSsid: business.wifiSsid || "",
      wifiSessionDurationMinutes:
        (business.wifiSessionDurationMinutes as any) ?? undefined,
      bandwidthKbps: (business.bandwidthKbps as any) ?? undefined,
      maxConcurrentConnections:
        (business.maxConcurrentConnections as any) ?? undefined,
      autoReconnect: (business.autoReconnect as any) ?? true,
      profileType: (business.profileType as any) || "private",
    });
  }, [business, form]);

  const progress = useMemo(() => {
    const idx = step - 1;
    return Math.round(((idx + 1) / 4) * 100);
  }, [step]);

  const saveCurrent = (next?: WizardStep) => {
    if (next) setStep(next);
  };

  const onNext = () => {
    if (step === 1) return saveCurrent(2);
    if (step === 2) return saveCurrent(3);
    if (step === 3) return saveCurrent(4);
    return undefined;
  };

  const onBack = () => {
    if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const previewValues = form.watch();

  const onFinish = form.handleSubmit((values) => {
    updateBusiness.mutate(
      {
        id: businessId,
        name: values.name,
        category: values.category?.trim() ? values.category.trim() : null,
        address: values.address?.trim() ? values.address.trim() : null,
        contactEmail: values.contactEmail?.trim()
          ? values.contactEmail.trim()
          : null,
        contactPhone: values.contactPhone?.trim()
          ? values.contactPhone.trim()
          : null,
        description: values.description?.trim()
          ? values.description.trim()
          : null,
        logoUrl: values.logoUrl?.trim() ? values.logoUrl.trim() : null,
        primaryColor: values.primaryColor?.trim()
          ? values.primaryColor.trim()
          : "#000000",
        photos: parseUrlList(values.photos),
        banners: parseUrlList(values.banners),
        videoUrl: values.videoUrl?.trim() ? values.videoUrl.trim() : null,
        wifiSsid: values.wifiSsid?.trim() ? values.wifiSsid.trim() : null,
        wifiSessionDurationMinutes: values.wifiSessionDurationMinutes ?? null,
        bandwidthKbps: values.bandwidthKbps ?? null,
        maxConcurrentConnections: values.maxConcurrentConnections ?? null,
        autoReconnect: values.autoReconnect ?? true,
        profileType: values.profileType || "private",
        onboardingCompleted: true,
      } as any,
      {
        onSuccess: () => {
          toast({
            title: "Setup Complete",
            description: "Your business profile has been saved.",
          });
          saveCurrent(4);
          setLocation(`/business/${businessId}`);
        },
      },
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar businessId={businessId} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Setup Wizard
            </h1>
            <p className="text-muted-foreground">
              Complete your business profile to launch your splash portal.
            </p>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-border/60 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Step 1: Basic Information"}
                {step === 2 && "Step 2: Visual Assets"}
                {step === 3 && "Step 3: WiFi Configuration"}
                {step === 4 && "Step 4: Ad Settings (Profile Type)"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about your venue."}
                {step === 2 &&
                  "Add photos and promotions for your splash page."}
                {step === 3 && "Configure guest WiFi settings."}
                {step === 4 && "Choose how advertising works on your portal."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  {step === 1 && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your business name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {businessCategories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="owner@business.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+1 555 123 4567"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description / tagline</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A short description for your splash page"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand color</FormLabel>
                              <div className="flex gap-3">
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || "#000000"}
                                  />
                                </FormControl>
                                <Input
                                  type="color"
                                  className="w-12 h-10 p-1 cursor-pointer"
                                  value={field.value || "#000000"}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="photos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Business photos (one URL per line)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="https://...\nhttps://..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="banners"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Promotional banners (one URL per line)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="https://...\nhttps://..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="wifiSsid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network SSID</FormLabel>
                            <FormControl>
                              <Input placeholder="Guest_WiFi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="wifiSessionDurationMinutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session duration (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="60"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bandwidthKbps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bandwidth per user (Kbps)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="2048"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="maxConcurrentConnections"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max concurrent connections</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="autoReconnect"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Auto reconnect returning visitors
                              </FormLabel>
                              <div className="flex items-center justify-between rounded-md border p-3">
                                <span className="text-sm text-muted-foreground">
                                  Enable auto-reconnect
                                </span>
                                <FormControl>
                                  <Switch
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <Dialog
                        open={isPreviewOpen}
                        onOpenChange={setIsPreviewOpen}
                      >
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline">
                            Preview Splash
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px]">
                          <DialogHeader>
                            <DialogTitle>Splash Preview</DialogTitle>
                          </DialogHeader>
                          <div className="rounded-xl border bg-white overflow-hidden">
                            <div className="px-6 pt-8 pb-6 text-center space-y-3 bg-gradient-to-b from-white to-gray-50">
                              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                                {previewValues.logoUrl?.trim() ? (
                                  <img
                                    src={previewValues.logoUrl.trim()}
                                    alt={previewValues.name || "Business"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Wifi className="w-9 h-9 text-primary" />
                                )}
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {previewValues.name || "Business name"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {previewValues.address || "Free Guest WiFi"}
                              </div>
                            </div>
                            <div className="p-4">
                              <Button
                                type="button"
                                className="w-full h-12 rounded-xl"
                                style={{
                                  backgroundColor:
                                    previewValues.primaryColor || undefined,
                                }}
                              >
                                Connect to WiFi
                              </Button>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  `/splash/${businessId}`,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              Open Full Splash
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setIsPreviewOpen(false)}
                            >
                              Done
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <FormField
                        control={form.control}
                        name="profileType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile mode</FormLabel>
                            <Select
                              value={field.value || "private"}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="private">
                                  Private (only your ads)
                                </SelectItem>
                                <SelectItem value="public">
                                  Public (mix + revenue sharing)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-md border p-4 bg-background">
                        {form.watch("profileType") === "private" ? (
                          <div className="space-y-2">
                            <p className="font-medium">Private profile mode</p>
                            <p className="text-sm text-muted-foreground">
                              Your splash page will show only your own campaigns
                              and branding.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-medium">Public profile mode</p>
                            <p className="text-sm text-muted-foreground">
                              Your splash page can show your content + platform
                              ads with revenue sharing.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      disabled={step === 1}
                    >
                      Back
                    </Button>

                    {step < 4 ? (
                      <Button type="button" onClick={onNext}>
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={onFinish}
                        disabled={updateBusiness.isPending}
                      >
                        {updateBusiness.isPending ? "Saving..." : "Finish"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
