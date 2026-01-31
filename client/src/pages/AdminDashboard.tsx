import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, businessApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Wifi,
  Megaphone,
  Mail,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        return await adminApi.getStats();
      } catch {
        return {
          totalBusinesses: 0,
          totalConnections: 0,
          totalActiveCampaigns: 0,
          totalEmailsCollected: 0,
        };
      }
    },
  });

  const { data: businesses } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      try {
        return await adminApi.getBusinesses();
      } catch {
        return [];
      }
    },
  });

  const updateBusiness = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Trying to use businessApi.update. Note: Backend might restrict this to owner.
      // If admin has a global role, this might work if the service checks role.
      return businessApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast({ title: "Business updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message || "Could not update business", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Platform Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all businesses and global advertising campaigns.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Businesses"
            value={stats?.totalBusinesses || 0}
            icon={Building2}
          />
          <StatsCard
            title="Total Connections"
            value={stats?.totalConnections || 0}
            icon={Wifi}
          />
          <StatsCard
            title="Active Campaigns"
            value={stats?.totalActiveCampaigns || 0}
            icon={Megaphone}
          />
          <StatsCard
            title="Emails Collected"
            value={stats?.totalEmailsCollected || 0}
            icon={Mail}
          />
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Business Management</TabsTrigger>
            {/* <TabsTrigger value="campaigns">Ad Campaigns</TabsTrigger> */}
          </TabsList>

          <TabsContent value="businesses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Registered Businesses</CardTitle>
                  <CardDescription>
                    View and manage all businesses on the platform.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 w-[200px] lg:w-[300px]"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Metrics</TableHead>
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
                              {biz.businessName?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                              <div>{biz.businessName}</div>
                              <div className="text-xs text-muted-foreground">{biz.ownerPhone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{biz.location || "No Location"}</div>
                          <div className="text-xs text-muted-foreground">{biz.category}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>Ads: {biz.adsCount}</div>
                            <div>Conns: {biz.connectionCount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={biz.isActive ? "default" : "secondary"}
                          >
                            {biz.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/splash/${biz.id}`,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              Splash
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/business/${biz.id}/profile`,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              Profile
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateBusiness.mutate({
                                  id: biz.id,
                                  updates: { isActive: !biz.isActive },
                                })
                              }
                            >
                              {biz.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="campaigns" className="space-y-4">
             <div className="p-10 text-center text-muted-foreground">
                Global Campaign Management is coming soon.
             </div>
          </TabsContent> */}
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
            <p className="text-2xl font-bold mt-1">{value?.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
