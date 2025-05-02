"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SlotBookingCalendar from "@/components/parent/SlotBookingCalendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ParentSlotsPage() {
  const [selectedChild, setSelectedChild] = useState<string>("1");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState<boolean>(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [children, setChildren] = useState<any[]>([]);
  const { user, signOut } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .select("id, name, date_of_birth, age_group_id, age_groups(name)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching children:", error);
    } else if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0].id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const selectedChildData = children.find(
    (child) => child.id === selectedChild,
  );

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setBookingDialogOpen(true);
  };

  const handleBookingConfirm = () => {
    setBookingDialogOpen(false);
    setConfirmationDialogOpen(true);
    // In a real app, this would send the booking request to the backend
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Book Childcare Slots</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Available Slots</CardTitle>
              <CardDescription>
                View and book available childcare slots for your child
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Child:</span>
                  <Select
                    value={selectedChild}
                    onValueChange={setSelectedChild}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} (
                          {child.age_groups?.name || "Unknown age group"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">View:</span>
                  <Tabs defaultValue="week" className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                    <TabsContent value="week"></TabsContent>
                    <TabsContent value="month"></TabsContent>
                  </Tabs>
                </div>
              </div>

              {selectedChildData && (
                <SlotBookingCalendar
                  childAgeGroup={
                    selectedChildData?.age_groups?.name || "3-5 years"
                  }
                  onSlotSelect={handleSlotSelect}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                Your upcoming childcare bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock upcoming bookings */}
                <div className="p-3 border rounded-md">
                  <div className="font-medium">Emma</div>
                  <div className="text-sm text-muted-foreground">
                    Monday, June 10
                  </div>
                  <div className="text-sm">Morning Session (8:00 - 13:00)</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="font-medium">Emma</div>
                  <div className="text-sm text-muted-foreground">
                    Wednesday, June 12
                  </div>
                  <div className="text-sm">Full Day (8:00 - 18:00)</div>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                Please review the details of your booking before confirming.
              </DialogDescription>
            </DialogHeader>

            {selectedSlot && selectedChildData && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Child:</div>
                  <div className="text-sm">{selectedChildData.name}</div>

                  <div className="text-sm font-medium">Age Group:</div>
                  <div className="text-sm">{selectedChildData.ageGroup}</div>

                  <div className="text-sm font-medium">Date:</div>
                  <div className="text-sm">{selectedSlot.date}</div>

                  <div className="text-sm font-medium">Session:</div>
                  <div className="text-sm">{selectedSlot.session}</div>

                  <div className="text-sm font-medium">Time:</div>
                  <div className="text-sm">{selectedSlot.time}</div>

                  <div className="text-sm font-medium">Price:</div>
                  <div className="text-sm">£{selectedSlot.price}</div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBookingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBookingConfirm}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmationDialogOpen}
          onOpenChange={setConfirmationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Confirmed!</DialogTitle>
              <DialogDescription>
                Your booking has been successfully confirmed.
              </DialogDescription>
            </DialogHeader>

            {selectedSlot && selectedChildData && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Child:</div>
                  <div className="text-sm">{selectedChildData.name}</div>

                  <div className="text-sm font-medium">Date:</div>
                  <div className="text-sm">{selectedSlot.date}</div>

                  <div className="text-sm font-medium">Session:</div>
                  <div className="text-sm">{selectedSlot.session}</div>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm">
                  <p>
                    A confirmation email has been sent to your registered email
                    address.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setConfirmationDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
