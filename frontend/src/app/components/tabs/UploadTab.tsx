import { useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Upload,
  FileCheck,
  Check,
  Loader2,
  Folder,
  Download,
  FileText,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import {
  processFiles,
  buildMerkleTree,
  getMerkleRoot,
  createManifest,
  exportManifestJSON,
  exportManifestPDF,
  formatBytes,
} from "@/utils/merkleUtils";
import { IntegrityManifest } from "@/utils/types";

interface UploadTabProps {
  onSaveFile: (file: any) => void;
}

export function UploadTab({ onSaveFile }: UploadTabProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");
  const [manifest, setManifest] = useState<IntegrityManifest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);


  const traverseFileTree = async (item: any, path = ''): Promise<File[]> => {
    return new Promise((resolve) => {
      // If file = gets file data
      if (item.isFile) {
        item.file((file: File) => {
          // Createnew file w full path
          const newFile = new File([file], file.name, { 
            type: file.type, 
            lastModified: file.lastModified 
          });
          
          // Add path info
          Object.defineProperty(newFile, 'webkitRelativePath', {
            value: path + file.name,
            writable: false
          });
          
          resolve([newFile]);
        });
      } 
      // If idirectory, reads all items inside
      else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries: any[]) => {
          const allFiles: File[] = [];
          
          // Goes through each item in the directory
          for (const entry of entries) {
            const subFiles = await traverseFileTree(entry, path + item.name + '/');
            allFiles.push(...subFiles);
          }
          
          resolve(allFiles);
        });
      } 
      // If it's neither, return sempty
      else {
        resolve([]);
      }
    });
  };

  // Generates Merkle Root for the uploaded files
  const generateMerkleRoot = async (fileList: File[]) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Hash all files
      setProgress(20);
      const fileHashes = await processFiles(fileList);
      
      // merkel tree buidling
      setProgress(60);
      const tree = buildMerkleTree(fileHashes);
      const root = getMerkleRoot(tree);
      
      // manifest/cert document
      setProgress(80);
      const newManifest = createManifest(fileHashes, root, {
        caseNumber: caseNumber || undefined,
        description: description || undefined,
      });
      
      setProgress(100);
      setMerkleRoot(root);
      setManifest(newManifest);
      toast.success("Merkle Root generated successfully");
      
    } catch (error) {
      console.error("Error generating Merkle Root:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate Merkle Root: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(Array.from(selectedFiles));
      setMerkleRoot("");
      setManifest(null);
      setIsComplete(false);
    }
  };

  const handleRemoveFolder = () => {
    setFiles([]);
    setMerkleRoot("");
    setManifest(null);
    setIsComplete(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    toast.info("Processing folder...");
    const allFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          const files = await traverseFileTree(entry);
          allFiles.push(...files);
        }
      }
    }

    if (allFiles.length > 0) {
      setFiles(allFiles);
      setMerkleRoot("");
      setManifest(null);
      setIsComplete(false);
      toast.success(`Loaded ${allFiles.length} file${allFiles.length > 1 ? 's' : ''}`);
    } else {
      toast.error("No files found in dropped item");
    }
  };

  const handleGenerateMerkleRoot = async () => {
    if (files.length === 0) return;
    await generateMerkleRoot(files);
  };

  const handleSaveFile = () => {
    if (files.length === 0 || !merkleRoot || !manifest) return;

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    const file = {
      id: Date.now().toString(),
      fileName: files.length === 1 ? files[0]!.name : `${files.length} files`,
      fileSize: totalSize,
      fileType: files.length === 1 ? files[0]!.type : "folder",
      hash: merkleRoot,
      description,
      caseNumber,
      timestamp: new Date().toISOString(),
      status: "sealed",
      fileCount: files.length,
    };

    onSaveFile(file);
    setIsComplete(true);
    toast.success("Files sealed successfully");
  };

  const handleNewUpload = () => {
    setFiles([]);
    setDescription("");
    setCaseNumber("");
    setMerkleRoot("");
    setManifest(null);
    setIsComplete(false);
    setProgress(0);
  };

  const handleExportJSON = () => {
    if (manifest) {
      exportManifestJSON(manifest);
      toast.success("Manifest exported as JSON");
    }
  };

  const handleExportPDF = () => {
    if (manifest) {
      exportManifestPDF(manifest);
      toast.success("Manifest exported as PDF");
    }
  };

  if (isComplete) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-4 w-full max-w-sm">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm mb-1">Files Sealed</h3>
            <p className="text-xs text-gray-500">
              {files.length} file{files.length > 1 ? 's' : ''} cryptographically protected
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-left text-xs space-y-2">
            <div>
              <span className="text-gray-500">Files:</span>
              <p>{files.length} file{files.length > 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-gray-500">Total Size:</span>
              <p>{manifest ? formatBytes(manifest.totalSize) : ''}</p>
            </div>
            <div>
              <span className="text-gray-500">Merkle Root:</span>
              <p className="font-mono text-[10px] break-all">
                {merkleRoot.substring(0, 40)}...
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">Export Manifest:</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleExportJSON}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <FileText className="w-3 h-3 mr-2" />
                JSON
              </Button>
              <Button
                onClick={handleExportPDF}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Download className="w-3 h-3 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <Button
            onClick={handleNewUpload}
            size="sm"
            className="w-full"
          >
            Seal More Files
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 h-full overflow-y-auto">
      {/* Drag & Drop Folder Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : files.length > 0
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => folderInputRef.current?.click()}
      >
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
        {files.length > 0 ? (
          <div className="space-y-2">
            <FileCheck className="w-8 h-8 text-green-600 mx-auto" />
            <p className="text-xs font-medium">{files.length} file{files.length > 1 ? 's' : ''} in folder</p>
            <p className="text-[10px] text-gray-500">
              {formatBytes(files.reduce((sum, f) => sum + f.size, 0))}
            </p>
            <p className="text-[10px] text-gray-400 mt-2">
              Click or drag to select different folder
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Folder className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-medium">
              {isDragging ? "Drop folder here" : "No folder selected"}
            </p>
            <p className="text-[10px] text-gray-500">
              {isDragging ? "Release to upload" : "Drag & drop or click to select a folder"}
            </p>
          </div>
        )}
      </div>

      {/* Folder Selection Button - Alternative */}
      <Button
        onClick={() => folderInputRef.current?.click()}
        variant="outline"
        className="w-full h-9 text-xs"
      >
        <Folder className="w-3.5 h-3.5 mr-2" />
        {files.length > 0 ? "Select Different Folder" : "Select Folder"}
      </Button>

      {/* Remove Folder Button - Only show if folder selected but not yet hashed */}
      {files.length > 0 && !merkleRoot && (
        <Button
          onClick={handleRemoveFolder}
          variant="destructive"
          className="w-full h-9 text-xs"
        >
          Remove Folder
        </Button>
      )}

      <p className="text-[10px] text-center text-gray-500 -mt-1">
        ⚠️ Folders only - Individual files not supported
      </p>

      {/* Case Number */}
      <div className="space-y-1.5">
        <Label htmlFor="case-number" className="text-xs">
          Case Number (Optional)
        </Label>
        <Input
          id="case-number"
          type="text"
          placeholder="e.g., CASE-2026-0001"
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          placeholder="File details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="text-xs resize-none"
        />
      </div>

      {/* Generate Merkle Root */}
      <div className="space-y-2">
        <Button
          onClick={handleGenerateMerkleRoot}
          disabled={files.length === 0 || isProcessing}
          className="w-full h-8 text-xs"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 mr-2" />
              Generate Merkle Root
            </>
          )}
        </Button>

        {isProcessing && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1" />
            <p className="text-[10px] text-center text-gray-500">
              Building Merkle Tree...
            </p>
          </div>
        )}
      </div>

      {/* Merkle Root Result */}
      {merkleRoot && manifest && (
        <div className="space-y-2">
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <Label className="text-[10px] text-green-700 block mb-1">
              Merkle Root (Master Hash)
            </Label>
            <p className="font-mono text-[9px] break-all text-green-900">
              {merkleRoot}
            </p>
            <div className="mt-2 pt-2 border-t border-green-200 text-[10px] text-green-700">
              <p>{manifest.totalFiles} files • {formatBytes(manifest.totalSize)}</p>
            </div>
          </div>

          <Button
            onClick={handleSaveFile}
            className="w-full h-8 text-xs"
          >
            Save & Seal Files
          </Button>
        </div>
      )}
    </div>
  );
}