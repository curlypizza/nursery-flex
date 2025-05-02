"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Slot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  ageGroup: string;
  available: boolean;
  capacity: {
    total: number;
    booked: number;
    available: number;
  };
}

interface SlotBookingCalendarProps {
  childAgeGroup?: string;
  onBookSlot?: (slot: Slot) => void;
}

const SlotBookingCalendar = ({
  childAgeGroup = "2-3 years",
  onBookSlot = () => {},
}: SlotBookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedAgeGroup, setSelectedAgeGroup] =
    useState<string>(childAgeGroup);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  // Mock data for available slots
  const mockSlots: Slot[] = [
    {
      id: "1",
      date: new Date(),
      startTime: "09:00",
      endTime: "12:00",
      ageGroup: "2-3 years",
      available: true,
      capacity: { total: 8, booked: 5, available: 3 },
    },
    {
      id: "2",
      date: new Date(),
      startTime: "13:00",
      endTime: "16:00",
      ageGroup: "2-3 years",
      available: true,
      capacity: { total: 8, booked: 7, available: 1 },
    },
    {
      id: "3",
      date: new Date(),
      startTime: "09:00",
      endTime: "16:00",
      ageGroup: "2-3 years",
      available: false,
      capacity: { total: 8, booked: 8, available: 0 },
    },
    {
      id: "4",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "09:00",
      endTime: "12:00",
      ageGroup: "2-3 years",
      available: true,
      capacity: { total: 8, booked: 3, available: 5 },
    },
    {
      id: "5",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "13:00",
      endTime: "16:00",
      ageGroup: "2-3 years",
      available: true,
      capacity: { total: 8, booked: 4, available: 4 },
    },
    {
      id: "6",
      date: new Date(),
      startTime: "09:00",
      endTime: "12:00",
      ageGroup: "0-2 years",
      available: true,
      capacity: { total: 6, booked: 4, available: 2 },
    },
    {
      id: "7",
      date: new Date(),
      startTime: "13:00",
      endTime: "16:00",
      ageGroup: "0-2 years",
      available: false,
      capacity: { total: 6, booked: 6, available: 0 },
    },
    {
      id: "8",
      date: new Date(),
      startTime: "09:00",
      endTime: "12:00",
      ageGroup: "3-5 years",
      available: true,
      capacity: { total: 12, booked: 8, available: 4 },
    },
  ];

  // Filter slots based on selected date and age group
  const getAvailableSlotsForDate = (
    date: Date | undefined,
    ageGroup: string,
  ) => {
    if (!date) return [];

    return mockSlots.filter(
      (slot) =>
        slot.date.toDateString() === date.toDateString() &&
        slot.ageGroup === ageGroup,
    );
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setBookingDialogOpen(true);
  };

  const handleBookSlot = () => {
    if (selectedSlot) {
      onBookSlot(selectedSlot);
      setBookingDialogOpen(false);
      setSelectedSlot(null);
    }
  };

  // Get dates with available slots for highlighting in the calendar
  const getDatesWithAvailableSlots = () => {
    const uniqueDates = new Set<string>();

    mockSlots.forEach((slot) => {
      if (slot.available && slot.ageGroup === selectedAgeGroup) {
        uniqueDates.add(slot.date.toDateString());
      }
    });

    return Array.from(uniqueDates).map((dateStr) => new Date(dateStr));
  };

  const availableDates = getDatesWithAvailableSlots();

  return (
    <div className="bg-white rounded-lg shadow-md w-full max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book a Childcare Slot</CardTitle>
          <CardDescription>
            Select a date and available slot for your child
          </CardDescription>
          <div className="mt-4">
            <Select
              value={selectedAgeGroup}
              onValueChange={setSelectedAgeGroup}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2 years">0-2 years</SelectItem>
                <SelectItem value="2-3 years">2-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                available: availableDates,
              }}
              modifiersStyles={{
                available: { backgroundColor: "#e6f7ff", fontWeight: "bold" },
              }}
            />
            <div className="mt-2 text-sm text-muted-foreground flex items-center">
              <div className="w-4 h-4 bg-[#e6f7ff] rounded-sm mr-2"></div>
              <span>Dates with available slots</span>
            </div>
          </div>

          <div className="md:w-1/2">
            <h3 className="text-lg font-medium mb-4">
              {selectedDate ? (
                <>Available slots for {selectedDate.toLocaleDateString()}</>
              ) : (
                <>Select a date to view available slots</>
              )}
            </h3>

            <div className="space-y-3">
              {selectedDate &&
              getAvailableSlotsForDate(selectedDate, selectedAgeGroup).length >
                0 ? (
                getAvailableSlotsForDate(selectedDate, selectedAgeGroup).map(
                  (slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 border rounded-md ${slot.available ? "hover:border-primary cursor-pointer" : "opacity-60 bg-muted"}`}
                      onClick={() => slot.available && handleSlotSelect(slot)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div>
                          {slot.available ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              Available
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800"
                            >
                              Full
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {slot.ageGroup} • {slot.capacity.available} spaces
                          left
                        </span>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total capacity: {slot.capacity.total}</p>
                              <p>Currently booked: {slot.capacity.booked}</p>
                              <p>Available spaces: {slot.capacity.available}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-md">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium">No available slots</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDate
                      ? "There are no available slots for this date and age group."
                      : "Please select a date to view available slots."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please review the details of your booking before confirming.
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Date:</div>
                <div>{selectedSlot.date.toLocaleDateString()}</div>

                <div className="text-muted-foreground">Time:</div>
                <div>
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </div>

                <div className="text-muted-foreground">Age Group:</div>
                <div>{selectedSlot.ageGroup}</div>

                <div className="text-muted-foreground">Available Spaces:</div>
                <div>
                  {selectedSlot.capacity.available} of{" "}
                  {selectedSlot.capacity.total}
                </div>
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
            <Button onClick={handleBookSlot} className="gap-2">
              <Check className="h-4 w-4" /> Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlotBookingCalendar;
