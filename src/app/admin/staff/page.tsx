"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LogOut, PlusCircle, Pencil, Trash2 } from "lucide-react";

export default function StaffManagementPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [staff, setStaff] = useState<any[]>([]);
  const [qualificationLevels, setQualificationLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false);
  const [editStaffDialogOpen, setEditStaffDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    qualification_level_id: "",
    is_pfa_holder: false,
  });

  useEffect(() => {
    fetchStaff();
    fetchQualificationLevels();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("staff")
      .select("*, staff_qualification_levels(name)")
      .order("name");

    if (error) {
      console.error("Error fetching staff:", error);
    } else {
      setStaff(data || []);
    }
    setIsLoading(false);
  };

  const fetchQualificationLevels = async () => {
    const { data, error } = await supabase
      .from("staff_qualification_levels")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching qualification levels:", error);
    } else {
      setQualificationLevels(data || []);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("staff").insert([
      {
        name: newStaff.name,
        email: newStaff.email,
        qualification_level_id: newStaff.qualification_level_id,
        is_pfa_holder: newStaff.is_pfa_holder,
      },
    ]);

    if (error) {
      console.error("Error adding staff:", error);
    } else {
      setAddStaffDialogOpen(false);
      setNewStaff({
        name: "",
        email: "",
        qualification_level_id: "",
        is_pfa_holder: false,
      });
      fetchStaff();
    }
  };

  const handleEditStaff = (staff: any) => {
    setCurrentStaff(staff);
    setEditStaffDialogOpen(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("staff")
      .update({
        name: currentStaff.name,
        email: currentStaff.email,
        qualification_level_id: currentStaff.qualification_level_id,
        is_pfa_holder: currentStaff.is_pfa_holder,
      })
      .eq("id", currentStaff.id);

    if (error) {
      console.error("Error updating staff:", error);
    } else {
      setEditStaffDialogOpen(false);
      fetchStaff();
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      const { error } = await supabase.from("staff").delete().eq("id", id);

      if (error) {
        console.error("Error deleting staff:", error);
      } else {
        fetchStaff();
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto py-6 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  Manage staff members and their qualifications
                </CardDescription>
              </div>
              <Dialog
                open={addStaffDialogOpen}
                onOpenChange={setAddStaffDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Staff Member</DialogTitle>
                    <DialogDescription>
                      Add a new staff member to the nursery
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStaff}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newStaff.name}
                          onChange={(e) =>
                            setNewStaff({ ...newStaff, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newStaff.email}
                          onChange={(e) =>
                            setNewStaff({ ...newStaff, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qualification">
                          Qualification Level
                        </Label>
                        <Select
                          value={newStaff.qualification_level_id}
                          onValueChange={(value) =>
                            setNewStaff({
                              ...newStaff,
                              qualification_level_id: value,
                            })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select qualification level" />
                          </SelectTrigger>
                          <SelectContent>
                            {qualificationLevels.map((level) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_pfa_holder"
                          checked={newStaff.is_pfa_holder}
                          onCheckedChange={(checked) =>
                            setNewStaff({
                              ...newStaff,
                              is_pfa_holder: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="is_pfa_holder">
                          Pediatric First Aid (PFA) Holder
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Staff Member</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading staff members...</div>
            ) : staff.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No staff members found. Add a staff member to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>PFA Holder</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.staff_qualification_levels?.name}
                      </TableCell>
                      <TableCell>
                        {member.is_pfa_holder ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStaff(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStaff(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={editStaffDialogOpen}
          onOpenChange={setEditStaffDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>Update staff member details</DialogDescription>
            </DialogHeader>
            {currentStaff && (
              <form onSubmit={handleUpdateStaff}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={currentStaff.name}
                      onChange={(e) =>
                        setCurrentStaff({
                          ...currentStaff,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={currentStaff.email}
                      onChange={(e) =>
                        setCurrentStaff({
                          ...currentStaff,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-qualification">
                      Qualification Level
                    </Label>
                    <Select
                      value={currentStaff.qualification_level_id}
                      onValueChange={(value) =>
                        setCurrentStaff({
                          ...currentStaff,
                          qualification_level_id: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification level" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualificationLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-is_pfa_holder"
                      checked={currentStaff.is_pfa_holder}
                      onCheckedChange={(checked) =>
                        setCurrentStaff({
                          ...currentStaff,
                          is_pfa_holder: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="edit-is_pfa_holder">
                      Pediatric First Aid (PFA) Holder
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Update Staff Member</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
