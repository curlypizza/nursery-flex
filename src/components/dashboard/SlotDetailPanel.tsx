"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Clock,
  X,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  qualification: string;
  qualificationLevel:
    | "Unqualified/Other"
    | "Student/Apprentice (Studying Level 2)"
    | "Student/Apprentice (Studying Level 3/6)"
    | "Level 2 Approved"
    | "Level 3 Approved"
    | "QTS / EYTS / EYPS / Level 6+";
  isPFAHolder: boolean;
}

interface Booking {
  id: string;
  childName: string;
  childAge: number;
  ageGroup: string;
  parentName: string;
  contactNumber: string;
}

interface RatioInfo {
  ageGroup: string;
  currentRatio: string;
  compliant: boolean;
  eyfsCompliant: boolean;
  pfaCompliant: boolean;
  capacity: {
    total: number;
    used: number;
    available: number;
  };
  qualificationDetails?: {
    hasLevel3: boolean;
    hasLevel2Ratio: boolean;
    hasQTS: boolean;
  };
}

interface SlotDetailPanelProps {
  date?: string;
  session?: string;
  isOpen?: boolean;
  onClose?: () => void;
  staffAssigned?: StaffMember[];
  bookings?: Booking[];
  ratioInfo?: RatioInfo[];
  isBlocked?: boolean;
  onBlockSlot?: () => void;
  onUnblockSlot?: () => void;
}

const SlotDetailPanel: React.FC<SlotDetailPanelProps> = ({
  date = "2023-05-15",
  session = "Morning",
  isOpen = true,
  onClose = () => {},
  staffAssigned = [
    {
      id: "1",
      name: "Jane Smith",
      qualification: "Early Years Educator",
      qualificationLevel: "Level 3 Approved",
      isPFAHolder: true,
    },
    {
      id: "2",
      name: "John Davis",
      qualification: "Childcare",
      qualificationLevel: "Level 2 Approved",
      isPFAHolder: false,
    },
    {
      id: "3",
      name: "Sarah Wilson",
      qualification: "Early Years Educator",
      qualificationLevel: "Level 3 Approved",
      isPFAHolder: false,
    },
  ],
  bookings = [
    {
      id: "1",
      childName: "Emma Thompson",
      childAge: 2,
      ageGroup: "2-3 years",
      parentName: "Michael Thompson",
      contactNumber: "07700 900123",
    },
    {
      id: "2",
      childName: "Oliver Brown",
      childAge: 1,
      ageGroup: "Under 2",
      parentName: "Jessica Brown",
      contactNumber: "07700 900456",
    },
    {
      id: "3",
      childName: "Sophie Clark",
      childAge: 4,
      ageGroup: "3-5 years",
      parentName: "Daniel Clark",
      contactNumber: "07700 900789",
    },
  ],
  ratioInfo = [
    {
      ageGroup: "Under 2",
      currentRatio: "1:3",
      compliant: true,
      eyfsCompliant: true,
      pfaCompliant: true,
      capacity: { total: 3, used: 1, available: 2 },
      qualificationDetails: {
        hasLevel3: true,
        hasLevel2Ratio: true,
        hasQTS: false,
      },
    },
    {
      ageGroup: "2-3 years",
      currentRatio: "1:4",
      compliant: true,
      eyfsCompliant: true,
      pfaCompliant: true,
      capacity: { total: 4, used: 1, available: 3 },
      qualificationDetails: {
        hasLevel3: true,
        hasLevel2Ratio: true,
        hasQTS: false,
      },
    },
    {
      ageGroup: "3-5 years",
      currentRatio: "1:8",
      compliant: true,
      eyfsCompliant: true,
      pfaCompliant: true,
      capacity: { total: 8, used: 1, available: 7 },
      qualificationDetails: {
        hasLevel3: true,
        hasLevel2Ratio: true,
        hasQTS: false,
      },
    },
  ],
  isBlocked = false,
  onBlockSlot = () => {},
  onUnblockSlot = () => {},
}) => {
  if (!isOpen) return null;

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full max-w-md h-full overflow-hidden bg-background border-l shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{formattedDate}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              {session} Session
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isBlocked ? (
          <Badge variant="destructive" className="mt-2">
            Blocked
          </Badge>
        ) : (
          <Badge variant="secondary" className="mt-2">
            Available
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-6">
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-6">
            {/* Staff Section */}
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Users className="h-4 w-4 mr-1" /> Staff Assigned (
                {staffAssigned.length})
              </h3>
              <div className="space-y-2">
                {staffAssigned.map((staff) => (
                  <div key={staff.id} className="bg-muted p-2 rounded-md">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{staff.name}</p>
                      {staff.isPFAHolder && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          PFA Holder
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-1">{staff.qualification}</p>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {staff.qualificationLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ratio Information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Ratio Compliance</h3>
              <div className="space-y-3">
                {ratioInfo.map((ratio) => (
                  <div key={ratio.ageGroup} className="bg-muted p-2 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{ratio.ageGroup}</p>
                      {ratio.compliant &&
                      ratio.eyfsCompliant &&
                      ratio.pfaCompliant ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Compliant
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" /> Non-Compliant
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-1">
                      Current Ratio: {ratio.currentRatio}
                    </p>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex justify-between text-xs">
                        <span>
                          Capacity: {ratio.capacity.used}/{ratio.capacity.total}
                        </span>
                        <span className="font-medium">
                          Available: {ratio.capacity.available}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {!ratio.pfaCompliant && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            No PFA Holder
                          </Badge>
                        )}
                        {!ratio.qualificationDetails?.hasLevel3 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            No Level 3 Staff
                          </Badge>
                        )}
                        {!ratio.qualificationDetails?.hasLevel2Ratio && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            Insufficient Level 2 Staff
                          </Badge>
                        )}
                        {ratio.ageGroup === "3-5 years" &&
                          ratio.qualificationDetails?.hasQTS && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200"
                            >
                              QTS/Level 6+ Present
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Bookings Section */}
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-1" /> Current Bookings (
                {bookings.length})
              </h3>
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-muted p-2 rounded-md">
                    <p className="font-medium">{booking.childName}</p>
                    <p className="text-xs">
                      {booking.ageGroup} (Age: {booking.childAge})
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{booking.parentName}</span>
                      <span>{booking.contactNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
        {isBlocked ? (
          <Button onClick={onUnblockSlot} variant="outline" className="w-full">
            Unblock Slot
          </Button>
        ) : (
          <Button onClick={onBlockSlot} variant="outline" className="w-full">
            Block Slot
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SlotDetailPanel;
