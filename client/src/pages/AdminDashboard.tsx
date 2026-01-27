import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useState } from "react";
import { 
  Users, 
  Wifi, 
  Megaphone, 
  Mail, 
  Building2, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampaignSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: statsData } = useQuery({
    queryKey: [api.admin.stats.path],
  });
  const stats = statsData as any;

  const { data: businessesData } = useQuery({
    queryKey: [api.businesses.list.path],
  });
  const businesses = businessesData as any[];

  const { data: campaignsData } = useQuery({
    queryKey: [api.campaigns.listAll.path],
  });
  const campaigns = campaignsData as any[];

  const updateBusiness = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(buildUrl(api.businesses.update.path, { id }), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
      toast({ title: "Business updated" });
    }
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(buildUrl(api.campaigns.update.path, { id }), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.listAll.path] });
      toast({ title: "Campaign updated" });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Platform Admin</h1>
          <p className="text-muted-foreground mt-1">Manage all businesses and global advertising campaigns.</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Businesses" value={stats?.totalBusinesses || 0} icon={Building2} />
          <StatsCard title="Total Connections" value={stats?.totalConnections || 0} icon={Wifi} />
          <StatsCard title="Active Campaigns" value={stats?.totalActiveCampaigns || 0} icon={Megaphone} />
          <StatsCard title="Emails Collected" value={stats?.totalEmailsCollected || 0} icon={Mail} />
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Business Management</TabsTrigger>
            <TabsTrigger value="campaigns">Ad Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Registered Businesses</CardTitle>
                  <CardDescription>View and manage all businesses on the platform.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8 w-[200px] lg:w-[300px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>SSID</TableHead>
                      <TableHead>Connections</TableHead>
                      <TableHead>Emails</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses?.map((biz: any) => (
                      <TableRow key={biz.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {biz.name.substring(0, 2).toUpperCase()}
                            </div>
                            {biz.name}
                          </div>
                        </TableCell>
                        <TableCell>{biz.wifiSsid}</TableCell>
                        <TableCell>{biz.connectionCount}</TableCell>
                        <TableCell>{biz.emailCount}</TableCell>
                        <TableCell>
                          <Badge variant={biz.isActive ? "default" : "secondary"}>
                            {biz.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateBusiness.mutate({ id: biz.id, updates: { isActive: !biz.isActive } })}
                          >
                            {biz.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-end">
              <CreateCampaignDialog businesses={businesses || []} />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Manage global and local advertising content.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Targets</TableHead>
                      <TableHead>Views/Clicks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns?.map((camp: any) => (
                      <TableRow key={camp.id}>
                        <TableCell className="font-medium">{camp.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{camp.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {camp.businessId ? (
                            <span className="text-sm">Single Business</span>
                          ) : (
                            <span className="text-sm">{camp.targetBusinessIds?.length || 0} Businesses</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{camp.views} views</div>
                            <div className="text-muted-foreground">{camp.clicks} clicks</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={camp.isActive ? "default" : "secondary"}>
                            {camp.isActive ? "Live" : "Paused"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updateCampaign.mutate({ id: camp.id, updates: { isActive: !camp.isActive } })}
                          >
                            {camp.isActive ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            {camp.isActive ? "Pause" : "Resume"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCampaignDialog({ businesses }: { businesses: any[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<any>({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      title: "",
      type: "banner",
      contentUrl: "",
      duration: 5,
      isActive: true,
      targetBusinessIds: [],
    }
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.campaigns.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.listAll.path] });
      toast({ title: "Campaign created successfully" });
      setOpen(false);
      form.reset();
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Global Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Ad Campaign</DialogTitle>
          <DialogDescription>Create an ad campaign to run across multiple businesses.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createCampaign.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl><Input placeholder="Summer Sale 2024" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="banner">Carousel Banner</SelectItem>
                        <SelectItem value="video">Video Ad</SelectItem>
                        <SelectItem value="static">Static Image</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (s)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image/Video URL</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetBusinessIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Businesses</FormLabel>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto">
                    {businesses.map((biz) => (
                      <div key={biz.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`biz-${biz.id}`} 
                          checked={field.value?.includes(biz.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            field.onChange(checked ? [...current, biz.id] : current.filter(id => id !== biz.id));
                          }}
                        />
                        <label htmlFor={`biz-${biz.id}`} className="text-sm font-medium leading-none">{biz.name}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? "Creating..." : "Launch Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
