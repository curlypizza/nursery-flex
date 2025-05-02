"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileForm() {
  const { user } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const [newChild, setNewChild] = useState({
    name: "",
    date_of_birth: new Date(),
    age_group_id: "",
    special_requirements: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchChildren();
      fetchAgeGroups();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }

    setIsLoading(false);
  };

  const fetchChildren = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .select("*, age_groups(name)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching children:", error);
    } else {
      setChildren(data || []);
    }
  };

  const fetchAgeGroups = async () => {
    const { data, error } = await supabase.from("age_groups").select("*");

    if (error) {
      console.error("Error fetching age groups:", error);
    } else {
      setAgeGroups(data || []);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;

      setMessage({ text: "Profile updated successfully", type: "success" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        text: error.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.from("children").insert({
        user_id: user?.id,
        name: newChild.name,
        date_of_birth: format(newChild.date_of_birth, "yyyy-MM-dd"),
        age_group_id: newChild.age_group_id,
        special_requirements: newChild.special_requirements,
      });

      if (error) throw error;

      setMessage({ text: "Child added successfully", type: "success" });
      setAddChildDialogOpen(false);
      setNewChild({
        name: "",
        date_of_birth: new Date(),
        age_group_id: "",
        special_requirements: "",
      });
      fetchChildren();
    } catch (error: any) {
      console.error("Error adding child:", error);
      setMessage({
        text: error.message || "Failed to add child",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileUpdate}>
          <CardContent className="space-y-4">
            {message && (
              <Alert
                variant={message.type === "success" ? "default" : "destructive"}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profile?.first_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile?.last_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile?.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Children</CardTitle>
              <CardDescription>
                Manage your children's information
              </CardDescription>
            </div>
            <Dialog
              open={addChildDialogOpen}
              onOpenChange={setAddChildDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Child</DialogTitle>
                  <DialogDescription>
                    Add your child's details to book slots for them
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddChild}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="child_name">Child's Name</Label>
                      <Input
                        id="child_name"
                        value={newChild.name}
                        onChange={(e) =>
                          setNewChild({ ...newChild, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {newChild.date_of_birth ? (
                              format(newChild.date_of_birth, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newChild.date_of_birth}
                            onSelect={(date) =>
                              date &&
                              setNewChild({ ...newChild, date_of_birth: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_group">Age Group</Label>
                      <Select
                        value={newChild.age_group_id}
                        onValueChange={(value) =>
                          setNewChild({ ...newChild, age_group_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="special_requirements">
                        Special Requirements
                      </Label>
                      <Input
                        id="special_requirements"
                        value={newChild.special_requirements}
                        onChange={(e) =>
                          setNewChild({
                            ...newChild,
                            special_requirements: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Child"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No children added yet. Add a child to book slots.
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <div key={child.id} className="border rounded-md p-4">
                  <div className="font-medium">{child.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Date of Birth:{" "}
                    {new Date(child.date_of_birth).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Age Group: {child.age_groups?.name || "Not specified"}
                  </div>
                  {child.special_requirements && (
                    <div className="text-sm mt-2">
                      <span className="font-medium">Special Requirements:</span>{" "}
                      {child.special_requirements}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
