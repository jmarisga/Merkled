import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, FileText, ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

interface RecordsTabProps {
  fileRecords: any[];
}

export function RecordsTab({
  fileRecords,
}: RecordsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<any>(null);

  const filteredRecords = fileRecords.filter((record) => {
    const search = searchTerm.toLowerCase();
    return (
      record.fileName.toLowerCase().includes(search) ||
      record.caseNumber?.toLowerCase().includes(search) ||
      record.description?.toLowerCase().includes(search)
    );
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 bg-gray-50 rounded px-2 h-8">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent p-0 h-6 text-xs focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Records List */}
      <ScrollArea className="flex-1">
        <div className="p-4 pt-2">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-500">
                {fileRecords.length === 0
                  ? "No sealed files yet"
                  : "No matching records"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs truncate">
                          {record.fileName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>
                          {formatFileSize(record.fileSize)}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(
                            record.timestamp,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {record.caseNumber && (
                        <p className="text-[10px] text-gray-600 mt-1">
                          {record.caseNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-[9px] px-1.5 py-0"
                      >
                        sealed
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              File Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete information
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">
                    File Name
                  </p>
                  <p className="text-xs">
                    {selectedRecord.fileName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">
                      Type
                    </p>
                    <p className="text-xs truncate">
                      {selectedRecord.fileType || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">
                      Size
                    </p>
                    <p className="text-xs">
                      {formatFileSize(selectedRecord.fileSize)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRecord.caseNumber && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">
                    Case Number
                  </p>
                  <p className="text-xs">
                    {selectedRecord.caseNumber}
                  </p>
                </div>
              )}

              {selectedRecord.description && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">
                    Description
                  </p>
                  <p className="text-xs">
                    {selectedRecord.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">
                  Sealed Date
                </p>
                <p className="text-xs">
                  {new Date(
                    selectedRecord.timestamp,
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 mb-1">
                  SHA-256 Hash
                </p>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-mono text-[9px] break-all">
                    {selectedRecord.hash}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedRecord.hash,
                    );
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  Copy Hash
                </Button>
                <Button
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 h-8 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}