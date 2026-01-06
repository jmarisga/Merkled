import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';
import { IntegrityManifest, FileHash, VerificationResult } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

//this is prompted
/**
 * Simple hash function - converts any data to SHA-256 hash
 * This is used by the Merkle Tree library
 */
function hashFunction(data: any): string {
  // If it's already a string, hash it directly
  if (typeof data === 'string') {
    return SHA256(data).toString();
  }
  
  // If it's something else, convert to string first
  return SHA256(String(data)).toString();
}

//Generate SHA-256 hash for a file 
// Return hash as hexadecimal string

export async function hashFile(file: File): Promise<string> {
  try {
    // Read the entire file as binary data
    const buffer = await file.arrayBuffer();
    
    // Try using the browser's built-in crypto (faster and more reliable)
    if (crypto && crypto.subtle) {
      // Hash the file data
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      
      // Convert hash to hexadecimal string (like: a1b2c3...)
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      
      return hashHex;
    }
    
    // Backup method using crypto-js library
    const uint8Array = new Uint8Array(buffer);
    const wordArray = CryptoJS.lib.WordArray.create(uint8Array as unknown as number[]);
    return SHA256(wordArray).toString();
    
  } catch (error) {
    console.error('Error hashing file: - merkleUtils.ts:51', file.name, error);
    throw new Error(`Failed to hash file: ${file.name}`);
  }
}

/**
 * Process all files in a folder and generate their hashes
 * Returns an array of file information with hashes
 */
export async function processFiles(files: FileList | File[]): Promise<FileHash[]> {
  // Convert FileList to regular array for easier handling
  const filesArray = Array.from(files);
  const fileHashes: FileHash[] = [];

  // Check if there are files to process
  if (filesArray.length === 0) {
    throw new Error('No files to process');
  }

  console.log(`Processing ${filesArray.length} files... - merkleUtils.ts:70`);

  // Go through each file one by one
  for (const file of filesArray) {
    try {
      // Skip system/hidden files (they start with '.')
      if (file.name.startsWith('.') || file.name === 'Thumbs.db' || file.name === 'desktop.ini') {
        console.log(`Skipping system file: ${file.name} - merkleUtils.ts:77`);
        continue;
      }

      // Generate hash for this file
      console.log(`Hashing: ${file.name} (${file.size} bytes) - merkleUtils.ts:82`);
      const hash = await hashFile(file);
      
      // Store file information
      const fileHash: FileHash = {
        path: file.name,
        relativePath: (file as any).webkitRelativePath || file.name,
        hash: hash,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString(),
      };
      
      fileHashes.push(fileHash);
    } catch (error) {
      console.error(`Error processing file ${file.name}: - merkleUtils.ts:96`, error);
      throw error;
    }
  }

  // Make sure we processed at least one file
  if (fileHashes.length === 0) {
    throw new Error('No valid files found to process');
  }

  console.log(`Successfully processed ${fileHashes.length} files - merkleUtils.ts:106`);
  return fileHashes;
}

/**
 * Build a Merkle Tree from file hashes
 * A Merkle Tree is like a pyramid of hashes:
 * - Bottom level: individual file hashes
 * - Each level up: combines two hashes together
 * - Top (root): single hash representing all files
 */
export function buildMerkleTree(fileHashes: FileHash[]): MerkleTree {
  // Make sure we have files to work with
  if (!fileHashes || fileHashes.length === 0) {
    throw new Error('Cannot build Merkle Tree: no file hashes provided');
  }

  console.log(`Building Merkle Tree with ${fileHashes.length} leaves... - merkleUtils.ts:123`);
  
  // Get just the hash strings from each file
  const leaves = fileHashes.map((fileHash) => fileHash.hash);
  
  // Create the Merkle Tree
  // sortPairs: Keep hashes in consistent order
  // hashLeaves: false because leaves are already hashed
  const tree = new MerkleTree(leaves, hashFunction, { 
    sortPairs: true,
    hashLeaves: false
  });
  
  console.log('Merkle Tree built successfully - merkleUtils.ts:136');
  return tree;
}

/**
 * Get the Merkle Root (top hash) from the tree
 * This single hash represents all files in the folder
 */
export function getMerkleRoot(tree: MerkleTree): string {
  try {
    const root = tree.getRoot();
    
    // Make sure we got a valid root
    if (!root) {
      throw new Error('Merkle Tree root is null');
    }
    
    // Convert root to string and return
    const rootString = root.toString('hex');
    console.log('Merkle Root: - merkleUtils.ts:155', rootString);
    return rootString;
    
  } catch (error) {
    console.error('Error getting Merkle Root: - merkleUtils.ts:159', error);
    throw new Error('Failed to get Merkle Root from tree');
  }
}

/**
 * Create an Integrity Manifest (report of all files and their hashes)
 * This is like a receipt that proves what files existed and their contents
 */
export function createManifest(
  fileHashes: FileHash[],
  merkleRoot: string,
  metadata?: {
    caseNumber?: string;
    description?: string;
    investigator?: string;
    organization?: string;
  }
): IntegrityManifest {
  // Calculate total size of all files
  let totalSize = 0;
  for (const file of fileHashes) {
    totalSize = totalSize + file.size;
  }

  // Create and return the manifest
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    merkleRoot: merkleRoot,
    totalFiles: fileHashes.length,
    totalSize: totalSize,
    files: fileHashes,
    metadata: metadata,
  };
}

/**
 * Export the manifest as a JSON file (downloads to user's computer)
 */
export function exportManifestJSON(manifest: IntegrityManifest): void {
  // Convert manifest object to JSON string (nicely formatted)
  const json = JSON.stringify(manifest, null, 2);
  
  // Create a downloadable file
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary download link and click it
  const link = document.createElement('a');
  link.href = url;
  link.download = `integrity-manifest-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export the manifest as a PDF file (downloads to user's computer)
 */
export function exportManifestPDF(manifest: IntegrityManifest): void {
  // Create a new PDF document
  const doc = new jsPDF();

  // Add header title
  doc.setFontSize(20);
  doc.text('Merkled - Integrity Manifest', 14, 22);

  // Add basic information
  doc.setFontSize(10);
  let yPosition = 35;

  doc.text(`Generated: ${new Date(manifest.timestamp).toLocaleString()}`, 14, yPosition);
  yPosition += 7;
  
  doc.text(`Total Files: ${manifest.totalFiles}`, 14, yPosition);
  yPosition += 7;
  
  doc.text(`Total Size: ${formatBytes(manifest.totalSize)}`, 14, yPosition);
  yPosition += 7;

  // Add optional metadata if provided
  if (manifest.metadata?.caseNumber) {
    doc.text(`Case Number: ${manifest.metadata.caseNumber}`, 14, yPosition);
    yPosition += 7;
  }

  if (manifest.metadata?.description) {
    doc.text(`Description: ${manifest.metadata.description}`, 14, yPosition);
    yPosition += 7;
  }

  // Add Merkle Root section
  doc.setFontSize(12);
  yPosition += 5;
  doc.text('Merkle Root (Master Hash):', 14, yPosition);
  yPosition += 7;
  
  // Show merkle root in monospace font
  doc.setFontSize(9);
  doc.setFont('courier');
  
  // Split long hash into multiple lines (60 characters per line)
  const chunkSize = 60;
  for (let i = 0; i < manifest.merkleRoot.length; i += chunkSize) {
    const chunk = manifest.merkleRoot.substring(i, i + chunkSize);
    doc.text(chunk, 14, yPosition);
    yPosition += 5;
  }

  // Add table of files
  yPosition += 5;
  doc.setFont('helvetica');
  
  // Prepare table data (one row per file)
  const tableData = manifest.files.map((file) => [
    file.relativePath,
    formatBytes(file.size),
    file.hash.substring(0, 32) + '...',  // Shorten hash for readability
  ]);

  // Create table
  autoTable(doc, {
    startY: yPosition,
    head: [['File Path', 'Size', 'SHA-256 Hash']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
    margin: { top: 10 },
  });

  // Save PDF file
  doc.save(`integrity-manifest-${Date.now()}.pdf`);
}

/**
 * Verify current files against a saved manifest
 * This checks if files have been modified, deleted, or added
 */
export async function verifyAgainstManifest(
  files: FileList | File[],
  manifest: IntegrityManifest
): Promise<VerificationResult> {
  // Step 1: Process current files and build their Merkle Tree
  const currentFileHashes = await processFiles(files);
  const currentTree = buildMerkleTree(currentFileHashes);
  const currentRoot = getMerkleRoot(currentTree);

  // Step 2: Compare Merkle Roots (quick check if anything changed)
  const merkleRootMatch = (currentRoot === manifest.merkleRoot);

  // Step 3: Compare individual files in detail
  // Create lookup maps for easy comparison
  const manifestFileMap = new Map<string, string>();
  for (const file of manifest.files) {
    manifestFileMap.set(file.relativePath, file.hash);
  }

  const currentFileMap = new Map<string, string>();
  for (const file of currentFileHashes) {
    currentFileMap.set(file.relativePath, file.hash);
  }

  // Arrays to track problems
  const tamperedFiles: string[] = [];  // Files that were modified
  const missingFiles: string[] = [];    // Files that were deleted
  const extraFiles: string[] = [];      // Files that were added

  // Check each file in the manifest
  for (const [filePath, originalHash] of manifestFileMap) {
    const currentHash = currentFileMap.get(filePath);
    
    if (!currentHash) {
      // File is missing
      missingFiles.push(filePath);
    } else if (currentHash !== originalHash) {
      // File was modified (hash doesn't match)
      tamperedFiles.push(filePath);
    }
    // else: file is OK (hash matches)
  }

  // Check for extra files (files that weren't in original manifest)
  for (const filePath of currentFileMap.keys()) {
    if (!manifestFileMap.has(filePath)) {
      extraFiles.push(filePath);
    }
  }

  // Calculate how many files are OK
  const filesMatched = currentFileHashes.length - tamperedFiles.length - extraFiles.length;

  // Everything is valid only if:
  // - Merkle root matches
  // - No files tampered, missing, or added
  const isValid = merkleRootMatch && 
                  tamperedFiles.length === 0 && 
                  missingFiles.length === 0 && 
                  extraFiles.length === 0;

  return {
    isValid: isValid,
    merkleRootMatch: merkleRootMatch,
    filesMatched: filesMatched,
    filesTotal: manifest.totalFiles,
    tamperedFiles: tamperedFiles,
    missingFiles: missingFiles,
    extraFiles: extraFiles,
  };
}

/**
 * Parse a manifest file (convert JSON text to object)
 */
export function parseManifest(jsonString: string): IntegrityManifest {
  return JSON.parse(jsonString);
}

/**
 * Format bytes to human-readable string
 * Examples: 1024 → "1 KB", 1048576 → "1 MB"
 */
export function formatBytes(bytes: number): string {
  // Handle zero bytes
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  // Size units
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const k = 1024;
  
  // Figure out which unit to use
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Calculate size in that unit
  const size = bytes / Math.pow(k, unitIndex);
  
  // Round to 2 decimal places
  const roundedSize = Math.round(size * 100) / 100;
  
  return roundedSize + ' ' + units[unitIndex];
}
