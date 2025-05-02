"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, Settings, LogOut } from "lucide-react";
import OccupancyCalendar from "@/components/dashboard/OccupancyCalendar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };
  return (
    <ProtectedRoute adminOnly>
      <div className="bg-background min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your nursery's occupancy and bookings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <CardDescription>Current week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Available Slots
              </CardTitle>
              <CardDescription>Current week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                Across all age groups
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Staff on Duty
              </CardTitle>
              <CardDescription>Today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                2 qualified, 6 assistants
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ratio Status
              </CardTitle>
              <CardDescription>Current</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Compliant</div>
              <p className="text-xs text-muted-foreground">
                All age groups within ratio
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="occupancy" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="occupancy">
              <Calendar className="h-4 w-4 mr-2" />
              Occupancy Calendar
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <BookOpen className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="occupancy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Calendar</CardTitle>
                <CardDescription>
                  View and manage your nursery's occupancy. Color-coded for
                  availability and ratio compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OccupancyCalendar />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Management</CardTitle>
                <CardDescription>
                  Manage staff schedules and qualifications to ensure proper
                  ratio compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                  Staff management interface will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  View and manage all current and upcoming bookings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                  Bookings interface will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
