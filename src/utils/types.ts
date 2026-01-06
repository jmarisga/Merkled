export interface FileHash {
  path: string;
  relativePath: string;
  hash: string;
  size: number;
  lastModified: string;
}

export interface IntegrityManifest {
  version: string;
  timestamp: string;
  merkleRoot: string;
  totalFiles: number;
  totalSize: number;
  files: FileHash[];
  metadata?: {
    caseNumber?: string;
    description?: string;
    investigator?: string;
    organization?: string;
  };
}

export interface VerificationResult {
  isValid: boolean;
  merkleRootMatch: boolean;
  filesMatched: number;
  filesTotal: number;
  tamperedFiles: string[];
  missingFiles: string[];
  extraFiles: string[];
}
