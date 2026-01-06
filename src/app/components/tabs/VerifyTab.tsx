import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Folder,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  parseManifest,
  verifyAgainstManifest,
} from "@/utils/merkleUtils";
import { IntegrityManifest, VerificationResult } from "@/utils/types";

interface VerifyTabProps {
  fileRecords: any[];
}

type VerificationStatus =
  | "idle"
  | "processing"
  | "authentic"
  | "tampered"
  | "not-found";

export function VerifyTab({}: VerifyTabProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [manifest, setManifest] = useState<IntegrityManifest | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const manifestInputRef = useRef<HTMLInputElement>(null);

  // Manifest-based verification
  const handleManifestSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      try {
        const text = await selectedFile.text();
        const parsedManifest = parseManifest(text);
        setManifest(parsedManifest);
        setVerificationStatus("idle");
      } catch (error) {
        console.error("Error parsing manifest:", error);
        alert("Invalid manifest file");
      }
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(Array.from(selectedFiles));
      setVerificationStatus("idle");
    }
  };

  const handleVerify = async () => {
    if (!manifest || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setVerificationStatus("processing");

    try {
      // Manifest-based folder verification
      setProgress(30);
      const result = await verifyAgainstManifest(files, manifest);
      setProgress(100);
      setVerificationResult(result);
      
      if (result.isValid) {
        setVerificationStatus("authentic");
      } else {
        setVerificationStatus("tampered");
      }
    } catch (error) {
      console.error("Error verifying files:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setManifest(null);
    setVerificationStatus("idle");
    setVerificationResult(null);
    setProgress(0);
  };

  return (
    <div className="p-4 space-y-3 h-full overflow-auto">
      {/* Header */}
      <div className="text-center pb-2 border-b">
        <h3 className="text-xs font-semibold text-gray-700">Folder Verification</h3>
        <p className="text-[10px] text-gray-500 mt-1">Verify folder integrity using Merkle Tree manifest</p>
      </div>

      {/* Upload Manifest */}
      <div className="space-y-2">
        <Label className="text-xs">1. Upload Integrity Manifest</Label>
        <input
          ref={manifestInputRef}
          type="file"
          accept=".json"
          onChange={handleManifestSelect}
          className="hidden"
        />
        <Button
          onClick={() => manifestInputRef.current?.click()}
          variant="outline"
          className="w-full h-8 text-xs"
        >
          <FileText className="w-3 h-3 mr-2" />
          {manifest ? "Manifest Loaded ✓" : "Select Manifest (.json)"}
        </Button>
        {manifest && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[10px]">
            <p className="text-blue-800">✓ Manifest loaded</p>
            <p className="text-blue-600">Expects {manifest.totalFiles} files</p>
          </div>
        )}
      </div>

      {/* Upload Folder */}
      {manifest && (
        <div className="space-y-2">
          <Label className="text-xs">2. Select Folder to Verify</Label>
          <input
            ref={folderInputRef}
            type="file"
            /* @ts-ignore */
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderSelect}
            className="hidden"
          />
          <Button
            onClick={() => folderInputRef.current?.click()}
            variant="default"
            className="w-full h-8 text-xs"
          >
            <Folder className="w-3 h-3 mr-2" />
            {files.length > 0 ? `${files.length} files selected ✓` : "Select Folder"}
          </Button>
          <p className="text-[10px] text-center text-gray-500">
            ⚠️ Folders only - Select the same folder that was sealed
          </p>
        </div>
      )}

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={!manifest || files.length === 0 || isProcessing}
        className="w-full h-8 text-xs"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Shield className="w-3 h-3 mr-2" />
            Verify Folder Integrity
          </>
        )}
      </Button>

      {/* Processing */}
      {isProcessing && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1" />
          <p className="text-[10px] text-center text-gray-500">
            Verifying Merkle Tree...
          </p>
        </div>
      )}

      {/* Verification Results */}
      {verificationResult && (
        <>
          {verificationResult.isValid ? (
            <Alert className="border-green-500 bg-green-50 p-3">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <AlertDescription className="text-xs">
                  <p className="text-green-800 mb-2">
                    ✓ All files are authentic
                  </p>
                  <div className="space-y-1 text-[10px]">
                    <div>
                      <span className="text-gray-600">Merkle Root:</span> Match ✓
                    </div>
                    <div>
                      <span className="text-gray-600">Files Verified:</span>{" "}
                      {verificationResult.filesMatched}/{verificationResult.filesTotal}
                    </div>
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <Alert className="border-red-500 bg-red-50 p-3">
              <div className="flex gap-2">
                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <AlertDescription className="text-xs">
                  <p className="text-red-800 mb-2">
                    ⚠ Integrity violation detected
                  </p>
                  <div className="space-y-1 text-[10px]">
                    <div>
                      <span className="text-gray-600">Merkle Root:</span>{" "}
                      {verificationResult.merkleRootMatch ? "Match ✓" : "Mismatch ✗"}
                    </div>
                    {verificationResult.tamperedFiles.length > 0 && (
                      <div>
                        <span className="text-gray-600">Tampered:</span>{" "}
                        {verificationResult.tamperedFiles.length} file(s)
                      </div>
                    )}
                    {verificationResult.missingFiles.length > 0 && (
                      <div>
                        <span className="text-gray-600">Missing:</span>{" "}
                        {verificationResult.missingFiles.length} file(s)
                      </div>
                    )}
                    {verificationResult.extraFiles.length > 0 && (
                      <div>
                        <span className="text-gray-600">Extra:</span>{" "}
                        {verificationResult.extraFiles.length} file(s)
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </>
      )}

      {/* Actions */}
      {verificationStatus !== "idle" &&
        verificationStatus !== "processing" && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full h-8 text-xs"
          >
            Verify Another Folder
          </Button>
        )}
    </div>
  );
}