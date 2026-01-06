import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";

// Define what pages the app can show
type Page =
  | "dashboard"
  | "upload"
  | "verify"
  | "records"
  | "profile";

// Define the structure of a file record
interface FileRecord {
  id: string;              
  fileName: string;         
  fileSize: number;         
  fileType: string;      
  hash: string;             // Merkle root hash
  description: string;     
  caseNumber: string;      
  timestamp: string;        // When it was sealed
  status: string;         
}

export default function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  const [fileRecords, setFileRecords] = useState<FileRecord[]>([]);


  useEffect(() => {
    const stored = localStorage.getItem("fileRecords");
    if (stored) {
      try {
        setFileRecords(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading records:", e);
      }
    }
  }, []);


  useEffect(() => {
    if (fileRecords.length > 0) {
      localStorage.setItem("fileRecords", JSON.stringify(fileRecords));
    }
  }, [fileRecords]);


  const handleLogin = () => {
    setIsAuthenticated(true);
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
  };


  const handleSaveFile = (file: FileRecord) => {

    setFileRecords((previousRecords) => [file, ...previousRecords]);
  };


  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-[450px] h-[550px]">
          <LoginPage onLogin={handleLogin} />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[450px] h-[550px] overflow-hidden">
        <Dashboard
          onLogout={handleLogout}
          fileRecords={fileRecords}
          onSaveFile={handleSaveFile}
        />
      </div>
      <Toaster />
    </div>
  );
}