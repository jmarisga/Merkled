import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Upload,
  Shield,
  FileText,
  User,
  FileCheck,
} from "lucide-react";
import { UploadTab } from "./tabs/UploadTab";
import { VerifyTab } from "./tabs/VerifyTab";
import { RecordsTab } from "./tabs/RecordsTab";
import { ProfileTab } from "./tabs/ProfileTab";

interface DashboardProps {
  onLogout?: () => void;
  fileRecords: any[];
  onSaveFile: (file: any) => void;
}

export function Dashboard({
  onLogout,
  fileRecords,
  onSaveFile,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <Card className="h-full flex flex-col rounded-none border-0 shadow-xl">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-white" />
          <CardTitle className="text-white text-sm">
            Merkled
          </CardTitle>
        </div>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <TabsList className="grid grid-cols-4 w-full h-auto p-1.5 rounded-none border-b bg-gray-50">
          <TabsTrigger
            value="upload"
            className="gap-1.5 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Seal
          </TabsTrigger>
          <TabsTrigger
            value="verify"
            className="gap-1.5 text-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            Verify
          </TabsTrigger>
          <TabsTrigger
            value="records"
            className="gap-1.5 text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Records
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="gap-1.5 text-xs"
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="upload" className="m-0 h-full overflow-y-auto">
            <UploadTab onSaveFile={onSaveFile} />
          </TabsContent>

          <TabsContent value="verify" className="m-0 h-full overflow-y-auto">
            <VerifyTab fileRecords={fileRecords} />
          </TabsContent>

          <TabsContent value="records" className="m-0 h-full overflow-y-auto">
            <RecordsTab fileRecords={fileRecords} />
          </TabsContent>

          <TabsContent value="profile" className="m-0 h-full overflow-y-auto">
            <ProfileTab onLogout={onLogout} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}