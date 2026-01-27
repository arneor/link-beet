import { useParams } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardSidebar } from "@/components/DashboardSidebar";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Wifi } from "lucide-react";
import { insertBusinessSchema } from "@shared/schema";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";

// Create a partial schema for updates, picking relevant fields
const profileFormSchema = insertBusinessSchema.pick({
  name: true,
  address: true,
  wifiSsid: true,
  primaryColor: true,
  logoUrl: true,
  profileType: true,
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function BusinessProfile() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");

  const { data: business, isLoading } = useBusiness(businessId);
  const updateBusiness = useUpdateBusiness();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      address: "",
      wifiSsid: "",
      primaryColor: "#000000",
      logoUrl: "",
      profileType: "private",
    },
  });

  useEffect(() => {
    if (!business) return;
    form.reset({
      name: business.name || "",
      address: business.address || "",
      wifiSsid: business.wifiSsid || "",
      primaryColor: business.primaryColor || "#000000",
      logoUrl: business.logoUrl || "",
      profileType: (business.profileType as any) || "private",
    });
  }, [business, form]);

  const previewValues = form.watch();
  const previewLogoUrl = useMemo(() => {
    const url = (previewValues.logoUrl || "").trim();
    return url.length ? url : null;
  }, [previewValues.logoUrl]);

  const onSubmit = (data: ProfileFormValues) => {
    updateBusiness.mutate({ id: businessId, ...data });
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar businessId={businessId} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Business Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your venue details and branding.
            </p>
          </div>

          <Card className="border-border/60 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
              <CardDescription>
                This information appears on your splash page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Joe's Coffee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wifiSsid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WiFi SSID (Network Name)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Joes_Free_WiFi"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="profileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Type</FormLabel>
                        <Select
                          value={(field.value as any) || "private"}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main St"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Color</FormLabel>
                          <div className="flex gap-3">
                            <FormControl>
                              <div className="relative flex-1">
                                <div
                                  className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border shadow-sm"
                                  style={{
                                    backgroundColor: field.value || "#000000",
                                  }}
                                />
                                <Input
                                  className="pl-12"
                                  {...field}
                                  value={field.value || "#000000"}
                                />
                              </div>
                            </FormControl>
                            <Input
                              type="color"
                              className="w-12 h-10 p-1 cursor-pointer"
                              {...field}
                              value={field.value || "#000000"}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <div className="flex gap-3">
                      <Dialog
                        open={isPreviewOpen}
                        onOpenChange={setIsPreviewOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            disabled={isLoading}
                          >
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px]">
                          <DialogHeader>
                            <DialogTitle>Splash Preview</DialogTitle>
                          </DialogHeader>
                          <div className="rounded-xl border bg-white overflow-hidden">
                            <div className="px-6 pt-8 pb-6 text-center space-y-3 bg-gradient-to-b from-white to-gray-50">
                              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                                {previewLogoUrl ? (
                                  <img
                                    src={previewLogoUrl}
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

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading || updateBusiness.isPending}
                        className="min-w-[140px]"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateBusiness.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </Button>
                    </div>
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
