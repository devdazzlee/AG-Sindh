import fs from 'fs';
import path from 'path';

/**
 * Utility to clean up temporary files in uploads folders
 * This should be run periodically to remove any files that weren't properly deleted
 */
export function cleanupUploadsFolders() {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const incomingDir = path.join(uploadsDir, 'incoming');
  const outgoingDir = path.join(uploadsDir, 'outgoing');

  console.log('🧹 Starting uploads cleanup...');

  // Clean incoming folder
  if (fs.existsSync(incomingDir)) {
    const incomingFiles = fs.readdirSync(incomingDir);
    console.log(`📁 Found ${incomingFiles.length} files in incoming folder`);
    
    incomingFiles.forEach(file => {
      const filePath = path.join(incomingDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${file}:`, error);
      }
    });
  }

  // Clean outgoing folder
  if (fs.existsSync(outgoingDir)) {
    const outgoingFiles = fs.readdirSync(outgoingDir);
    console.log(`📁 Found ${outgoingFiles.length} files in outgoing folder`);
    
    outgoingFiles.forEach(file => {
      const filePath = path.join(outgoingDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${file}:`, error);
      }
    });
  }

  console.log('✅ Uploads cleanup completed');
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupUploadsFolders();
} 