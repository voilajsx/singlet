/**
 * @voilajs/appkit - Local filesystem storage provider
 * @module @voilajs/appkit/storage/providers/local
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { StorageProvider } from './base.js';

const pipelineAsync = promisify(pipeline);

/**
 * Local filesystem storage provider
 * @extends StorageProvider
 */
export class LocalProvider extends StorageProvider {
  constructor(config = {}) {
    super(config);
    this.basePath = config.basePath || './storage';
    this.baseUrl = config.baseUrl || '/storage';
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    // Ensure base directory exists
    await fs.promises.mkdir(this.basePath, { recursive: true });
  }

  /**
   * Uploads a file
   * @param {Buffer|Stream} file - File content
   * @param {string} filePath - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, path: string}>} Upload result
   */
  async upload(file, filePath, options = {}, onProgress = null) {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.promises.mkdir(dir, { recursive: true });

    let size;

    if (Buffer.isBuffer(file)) {
      // Handle Buffer
      await fs.promises.writeFile(fullPath, file);
      size = file.length;

      // Call progress callback with 100%
      if (onProgress) {
        onProgress(100);
      }
    } else if (file.pipe) {
      // Handle Stream with progress reporting
      const writeStream = fs.createWriteStream(fullPath);

      if (onProgress && file.readable && typeof file.on === 'function') {
        let totalBytes = options.fileSize;
        let processedBytes = 0;

        // Check if we know the content length
        if (!totalBytes && file.headers && file.headers['content-length']) {
          totalBytes = parseInt(file.headers['content-length'], 10);
        }

        // If we still don't know the size, we can't report accurate progress
        if (totalBytes) {
          file.on('data', (chunk) => {
            processedBytes += chunk.length;
            const percent = Math.min(
              Math.round((processedBytes / totalBytes) * 100),
              100
            );
            onProgress(percent);
          });
        }
      }

      await pipelineAsync(file, writeStream);
      const stats = await fs.promises.stat(fullPath);
      size = stats.size;

      // Ensure final progress callback
      if (onProgress) {
        onProgress(100);
      }
    } else {
      throw new Error('File must be Buffer or Stream');
    }

    // Auto-detect content type if not provided
    const contentType = options.contentType || this.detectContentType(filePath);

    return {
      url: this.getUrl(filePath),
      size,
      path: filePath,
      contentType,
    };
  }

  /**
   * Uploads a large file using streaming
   * @param {Buffer|Stream|string} file - File content or path to file
   * @param {string} filePath - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, path: string}>} Upload result
   */
  async uploadLarge(file, filePath, options = {}, onProgress = null) {
    // For local provider, handle string input (file path) as a special case
    if (typeof file === 'string') {
      const sourceStream = fs.createReadStream(file);
      const stat = await fs.promises.stat(file);
      return this.upload(
        sourceStream,
        filePath,
        { ...options, fileSize: stat.size },
        onProgress
      );
    }

    // Otherwise, use regular upload method
    return this.upload(file, filePath, options, onProgress);
  }

  /**
   * Downloads a file
   * @param {string} filePath - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async download(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Downloads a file as a stream
   * @param {string} filePath - Storage path
   * @returns {Promise<Stream>} Readable stream
   */
  async downloadStream(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      // Check if file exists first
      await fs.promises.access(fullPath);

      // Return readable stream
      return fs.createReadStream(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Deletes a file
   * @param {string} filePath - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Gets a file URL
   * @param {string} filePath - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(filePath, options = {}) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${normalizedPath}`;
  }

  /**
   * Checks if a file exists
   * @param {string} filePath - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @param {Object} [options] - List options
   * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
   */
  async list(prefix = '', options = {}) {
    const { recursive = true, limit = 1000 } = options;
    const fullPath = path.join(this.basePath, prefix);
    const files = [];

    async function walkDir(dir, baseDir) {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, entryPath);

          if (entry.isFile()) {
            const stats = await fs.promises.stat(entryPath);
            files.push({
              path: relativePath.replace(/\\/g, '/'),
              size: stats.size,
              modified: stats.mtime,
            });

            if (files.length >= limit) {
              break;
            }
          } else if (entry.isDirectory() && recursive) {
            await walkDir(entryPath, baseDir);

            if (files.length >= limit) {
              break;
            }
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    await walkDir(fullPath, this.basePath);
    return files.slice(0, limit);
  }

  /**
   * Gets file metadata
   * @param {string} filePath - Storage path
   * @returns {Promise<{size: number, modified: Date, contentType?: string}>} File metadata
   */
  async getMetadata(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      const stats = await fs.promises.stat(fullPath);

      // Determine content type based on extension
      const contentType = this.detectContentType(filePath);

      return {
        size: stats.size,
        modified: stats.mtime,
        contentType,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Copies a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    const sourcePath = path.join(this.basePath, source);
    const destPath = path.join(this.basePath, destination);
    const destDir = path.dirname(destPath);

    try {
      // Ensure destination directory exists
      await fs.promises.mkdir(destDir, { recursive: true });

      // Copy file
      await fs.promises.copyFile(sourcePath, destPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw error;
    }
  }

  /**
   * Moves/renames a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    const sourcePath = path.join(this.basePath, source);
    const destPath = path.join(this.basePath, destination);
    const destDir = path.dirname(destPath);

    try {
      // Ensure destination directory exists
      await fs.promises.mkdir(destDir, { recursive: true });

      // Move file
      await fs.promises.rename(sourcePath, destPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw error;
    }
  }

  /**
   * Creates a directory
   * @param {string} dirPath - Directory path
   * @returns {Promise<boolean>} Success status
   */
  async createDirectory(dirPath) {
    const fullPath = path.join(this.basePath, dirPath);

    try {
      await fs.promises.mkdir(fullPath, { recursive: true });
      return true;
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }
}
