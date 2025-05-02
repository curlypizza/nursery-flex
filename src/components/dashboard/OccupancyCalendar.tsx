"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Users,
  AlertTriangle,
} from "lucide-react";
import SlotDetailPanel from "./SlotDetailPanel";

interface OccupancyCalendarProps {
  initialDate?: Date;
  view?: "day" | "week" | "month";
}

export default function OccupancyCalendar({
  initialDate = new Date(),
  view = "week",
}: OccupancyCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedView, setSelectedView] = useState<string>(view);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    session: string;
  } | null>(null);

  // Mock data for calendar slots
  const mockSlots = [
    {
      date: new Date(),
      session: "Morning",
      status: "available",
      occupancy: 75,
      eyfsCompliant: true,
      pfaCompliant: true,
      fundedHoursAvailable: true,
      qualificationIssues: [],
    },
    {
      date: new Date(),
      session: "Afternoon",
      status: "full",
      occupancy: 100,
      eyfsCompliant: true,
      pfaCompliant: true,
      fundedHoursAvailable: true,
      qualificationIssues: [],
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      session: "Morning",
      status: "warning",
      occupancy: 90,
      eyfsCompliant: false,
      pfaCompliant: true,
      fundedHoursAvailable: true,
      qualificationIssues: ["Insufficient Level 2 Staff"],
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      session: "Afternoon",
      status: "available",
      occupancy: 60,
      eyfsCompliant: true,
      pfaCompliant: true,
      fundedHoursAvailable: false,
      qualificationIssues: [],
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      session: "Morning",
      status: "blocked",
      occupancy: 0,
      eyfsCompliant: true,
      pfaCompliant: true,
      fundedHoursAvailable: false,
      qualificationIssues: [],
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      session: "Afternoon",
      status: "available",
      occupancy: 40,
      eyfsCompliant: true,
      pfaCompliant: false,
      fundedHoursAvailable: true,
      qualificationIssues: ["No PFA Holder"],
    },
  ];

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (selectedView === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (selectedView === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (selectedView === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (selectedView === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleSlotClick = (date: Date, session: string) => {
    setSelectedSlot({ date, session });
  };

  const handleClosePanel = () => {
    setSelectedSlot(null);
  };

  const getStatusBadge = (slot: any) => {
    // First check EYFS compliance issues
    if (!slot.pfaCompliant) {
      return <Badge className="bg-red-500">No PFA Holder</Badge>;
    }

    if (!slot.eyfsCompliant) {
      return <Badge className="bg-red-500">EYFS Non-Compliant</Badge>;
    }

    // Then check regular status
    switch (slot.status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Near Capacity</Badge>;
      case "full":
        return <Badge className="bg-red-500">Full</Badge>;
      case "blocked":
        return <Badge className="bg-gray-500">Blocked</Badge>;
      default:
        return null;
    }
  };

  const getFundedHoursBadge = (slot: any) => {
    if (slot.fundedHoursAvailable) {
      return <Badge className="bg-blue-500 ml-1">Funded</Badge>;
    }
    return null;
  };

  const renderDayView = () => {
    const daySlots = mockSlots.filter(
      (slot) => slot.date.toDateString() === currentDate.toDateString(),
    );

    return (
      <div className="grid grid-cols-1 gap-4">
        {daySlots.map((slot, index) => (
          <Card
            key={index}
            className={`cursor-pointer hover:shadow-md transition-shadow ${slot.status === "blocked" ? "opacity-60" : ""}`}
            onClick={() => handleSlotClick(slot.date, slot.session)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{slot.session} Session</h3>
                <div className="flex items-center mt-2 space-x-2">
                  {getStatusBadge(slot)}
                  {getFundedHoursBadge(slot)}
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {slot.occupancy}% Occupancy
                  </div>
                </div>
                {slot.qualificationIssues.length > 0 && (
                  <div className="mt-1 text-xs text-red-500">
                    {slot.qualificationIssues.join(", ")}
                  </div>
                )}
              </div>
              {slot.status === "warning" && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="flex flex-col">
            <div className="text-center p-2 font-medium">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {["Morning", "Afternoon"].map((session, sessionIndex) => {
                const slot = mockSlots.find(
                  (s) =>
                    s.date.toDateString() === day.toDateString() &&
                    s.session === session,
                );

                return (
                  <Card
                    key={sessionIndex}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${!slot || slot.status === "blocked" ? "opacity-60" : ""}`}
                    onClick={() => slot && handleSlotClick(day, session)}
                  >
                    <CardContent className="p-2 flex flex-col items-center">
                      <div className="text-sm font-medium">{session}</div>
                      {slot ? (
                        <>
                          {getStatusBadge(slot)}
                          {getFundedHoursBadge(slot)}
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            {slot.occupancy}%
                          </div>
                          {slot.qualificationIssues.length > 0 && (
                            <div className="mt-1 text-xs text-red-500">
                              {slot.qualificationIssues[0]}
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge className="bg-gray-500 mt-1">No Data</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={(date) => date && setCurrentDate(date)}
        className="rounded-md border"
        date={currentDate.getTime()}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex h-full">
      <div className={`flex-1 ${selectedSlot ? "pr-4" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Occupancy Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                ...(selectedView === "day" && { day: "numeric" }),
                ...(selectedView === "week" && { day: "numeric" }),
              })}
            </span>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={selectedView}
            onValueChange={setSelectedView}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Badge className="bg-green-500">Available</Badge>
            <Badge className="bg-yellow-500">Near Capacity</Badge>
            <Badge className="bg-red-500">Full</Badge>
            <Badge className="bg-gray-500">Blocked</Badge>
            <Badge className="bg-red-500">EYFS Non-Compliant</Badge>
            <Badge className="bg-blue-500">Funded</Badge>
          </div>

          <Tabs value={selectedView}>
            <TabsContent value="day" className="mt-2">
              {renderDayView()}
            </TabsContent>
            <TabsContent value="week" className="mt-2">
              {renderWeekView()}
            </TabsContent>
            <TabsContent value="month" className="mt-2">
              {renderMonthView()}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedSlot && (
        <SlotDetailPanel
          date={selectedSlot.date}
          session={selectedSlot.session}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
