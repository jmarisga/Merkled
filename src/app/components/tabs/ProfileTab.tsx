import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, Mail, Building, Save, LogOut } from "lucide-react";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

interface ProfileTabProps {
  onLogout?: () => void;
}

export function ProfileTab({ onLogout }: ProfileTabProps) {
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    organization: "Digital Forensics Unit",
    role: "File Manager",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated");
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm">{profile.fullName}</p>
          <p className="text-xs text-gray-500">
            {profile.email}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs">
            Full Name
          </Label>
          <Input
            id="fullName"
            value={profile.fullName}
            onChange={(e) =>
              setProfile({
                ...profile,
                fullName: e.target.value,
              })
            }
            disabled={!isEditing}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">
            Email Address
          </Label>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email: e.target.value,
                })
              }
              disabled={!isEditing}
              className="flex-1 h-8 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="organization" className="text-xs">
            Organization
          </Label>
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-gray-400" />
            <Input
              id="organization"
              value={profile.organization}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  organization: e.target.value,
                })
              }
              disabled={!isEditing}
              className="flex-1 h-8 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-xs">
            Role
          </Label>
          <Input
            id="role"
            value={profile.role}
            onChange={(e) =>
              setProfile({ ...profile, role: e.target.value })
            }
            disabled={!isEditing}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full h-8 text-xs"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-8 text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="pt-4 border-t">
        <p className="text-xs mb-3">System Information</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">
              Account Created
            </span>
            <span>Jan 1, 2026</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Last Login</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">
              Hash Algorithm
            </span>
            <span>SHA-256</span>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      {onLogout && (
        <div className="pt-4 border-t">
          <Button
            onClick={onLogout}
            variant="destructive"
            className="w-full h-8 text-xs"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}