/**
 * @voilajs/appkit - AWS S3 storage provider
 * @module @voilajs/appkit/storage/providers/s3
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './base.js';
import { createReadStream, promises as fsPromises, statSync } from 'fs';
import { basename, dirname } from 'path';

// Size constants for multipart uploads
const MIN_PART_SIZE = 5 * 1024 * 1024; // 5MB minimum part size required by S3
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB default chunk size

/**
 * AWS S3 storage provider
 * @extends StorageProvider
 */
export class S3Provider extends StorageProvider {
  constructor(config = {}) {
    super(config);
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    this.credentials = config.credentials;
    this.endpoint = config.endpoint;
    this.forcePathStyle = config.forcePathStyle || false;
    this.publicRead = config.publicRead || false;
    this.baseUrl =
      config.baseUrl ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.bucket) {
      throw new Error('S3 bucket name is required');
    }

    // Initialize S3 client
    const clientConfig = {
      region: this.region,
      forcePathStyle: this.forcePathStyle,
    };

    if (this.credentials) {
      clientConfig.credentials = this.credentials;
    }

    if (this.endpoint) {
      clientConfig.endpoint = this.endpoint;
    }

    this.client = new S3Client(clientConfig);
  }

  /**
   * Uploads a file
   * @param {Buffer|Stream} file - File content
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, etag: string}>} Upload result
   */
  async upload(file, path, options = {}, onProgress = null) {
    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: file,
      ContentType: options.contentType || this.detectContentType(path),
    };

    if (this.publicRead || options.public) {
      params.ACL = 'public-read';
    }

    if (options.metadata) {
      params.Metadata = options.metadata;
    }

    if (options.cacheControl) {
      params.CacheControl = options.cacheControl;
    }

    try {
      const command = new PutObjectCommand(params);
      const response = await this.client.send(command);

      // Call progress callback with 100% completion
      if (typeof onProgress === 'function') {
        onProgress(100);
      }

      // Get file size
      let size;
      if (Buffer.isBuffer(file)) {
        size = file.length;
      } else {
        // For streams, we need to get the size after upload
        const metadata = await this.getMetadata(path);
        size = metadata.size;
      }

      return {
        url: this.getUrl(path),
        size,
        etag: response.ETag?.replace(/"/g, ''),
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Uploads a large file using multipart upload
   * @param {Buffer|Stream|string} file - File content or path to file
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, etag: string}>} Upload result
   */
  async uploadLarge(file, path, options = {}, onProgress = null) {
    let fileStream;
    let fileSize;
    let localFile = false;

    try {
      // Handle various input types
      if (typeof file === 'string') {
        // It's a file path
        const stats = statSync(file);
        fileSize = stats.size;
        fileStream = createReadStream(file);
        localFile = true;
      } else if (Buffer.isBuffer(file)) {
        fileSize = file.length;
        // Convert Buffer to stream
        const { Readable } = await import('stream');
        fileStream = Readable.from(file);
      } else if (file.pipe) {
        // It's already a stream
        fileStream = file;
        fileSize = options.fileSize; // Should be provided for streams

        if (!fileSize && file.headers && file.headers['content-length']) {
          fileSize = parseInt(file.headers['content-length'], 10);
        }

        if (!fileSize) {
          throw new Error('File size must be provided for stream uploads');
        }
      } else {
        throw new Error('File must be a Buffer, Stream, or file path');
      }

      // Set up multipart upload parameters
      const contentType = options.contentType || this.detectContentType(path);

      const createParams = {
        Bucket: this.bucket,
        Key: path,
        ContentType: contentType,
      };

      if (this.publicRead || options.public) {
        createParams.ACL = 'public-read';
      }

      if (options.metadata) {
        createParams.Metadata = options.metadata;
      }

      if (options.cacheControl) {
        createParams.CacheControl = options.cacheControl;
      }

      // Create multipart upload
      const multipartUpload = await this.client.send(
        new CreateMultipartUploadCommand(createParams)
      );

      const uploadId = multipartUpload.UploadId;

      // Calculate part size
      const chunkSize = Math.max(
        MIN_PART_SIZE,
        options.chunkSize || DEFAULT_CHUNK_SIZE
      );

      // Calculate total parts
      const totalParts = Math.ceil(fileSize / chunkSize);

      // Track uploaded parts
      const uploadedParts = [];
      let uploadedBytes = 0;

      try {
        // Handle file upload in chunks
        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          // Create chunk of data
          const start = (partNumber - 1) * chunkSize;
          const end = Math.min(partNumber * chunkSize, fileSize);
          let chunkData;

          if (localFile) {
            // For file path input, use a slice of the file
            const chunkStream = createReadStream(file, { start, end: end - 1 });

            // Convert stream to buffer
            const chunks = [];
            for await (const chunk of chunkStream) {
              chunks.push(chunk);
            }
            chunkData = Buffer.concat(chunks);
          } else {
            // For streams, we need to read N bytes
            // This is a simplification - real stream handling would be more complex
            // and may need to buffer chunks until we have the right amount of data
            const chunks = [];
            const chunkSize = end - start;
            let bytesRead = 0;

            // Read from stream until we have the chunk
            for await (const chunk of fileStream) {
              chunks.push(chunk);
              bytesRead += chunk.length;
              if (bytesRead >= chunkSize) break;
            }

            chunkData = Buffer.concat(chunks);
          }

          // Upload part
          const uploadPartResponse = await this.client.send(
            new UploadPartCommand({
              Bucket: this.bucket,
              Key: path,
              UploadId: uploadId,
              PartNumber: partNumber,
              Body: chunkData,
            })
          );

          // Add part info to our list
          uploadedParts.push({
            PartNumber: partNumber,
            ETag: uploadPartResponse.ETag,
          });

          // Update progress
          uploadedBytes += chunkData.length;
          const progressPercent = Math.min(
            Math.round((uploadedBytes / fileSize) * 100),
            99 // We'll report 100% after completion
          );

          if (typeof onProgress === 'function') {
            onProgress(progressPercent);
          }
        }

        // Complete the multipart upload
        const completeMultipartUploadResponse = await this.client.send(
          new CompleteMultipartUploadCommand({
            Bucket: this.bucket,
            Key: path,
            UploadId: uploadId,
            MultipartUpload: {
              Parts: uploadedParts,
            },
          })
        );

        // Report 100% completion
        if (typeof onProgress === 'function') {
          onProgress(100);
        }

        return {
          url: this.getUrl(path),
          size: fileSize,
          etag: completeMultipartUploadResponse.ETag?.replace(/"/g, ''),
        };
      } catch (error) {
        // Abort multipart upload on error
        await this.client.send(
          new AbortMultipartUploadCommand({
            Bucket: this.bucket,
            Key: path,
            UploadId: uploadId,
          })
        );

        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to upload large file: ${error.message}`);
    } finally {
      // Clean up if we created a file stream
      if (localFile && fileStream) {
        fileStream.destroy();
      }
    }
  }

  /**
   * Downloads a file
   * @param {string} path - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async download(path) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.client.send(command);
      const chunks = [];

      // Convert stream to buffer
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Downloads a file as a stream
   * @param {string} path - Storage path
   * @returns {Promise<Stream>} Readable stream
   */
  async downloadStream(path) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.client.send(command);

      // Return the readable stream directly
      return response.Body;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to download file stream: ${error.message}`);
    }
  }

  /**
   * Deletes a file
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(path) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Gets a file URL
   * @param {string} path - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(path, options = {}) {
    if (options.signed) {
      // Return a promise for signed URL
      return this.getSignedUrl(path, options);
    }

    // Return public URL
    return `${this.baseUrl}/${path}`;
  }

  /**
   * Gets a signed URL for temporary access
   * @param {string} path - Storage path
   * @param {Object} [options] - Signed URL options
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(path, options = {}) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    try {
      return await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn || 3600, // 1 hour default
      });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Checks if a file exists
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(path) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @param {Object} [options] - List options
   * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
   */
  async list(prefix = '', options = {}) {
    const { maxKeys = 1000, delimiter = options.recursive ? undefined : '/' } =
      options;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
        Delimiter: delimiter,
      });

      const response = await this.client.send(command);
      const files = [];

      if (response.Contents) {
        for (const item of response.Contents) {
          files.push({
            path: item.Key,
            size: item.Size,
            modified: item.LastModified,
          });
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Gets file metadata
   * @param {string} path - Storage path
   * @returns {Promise<{size: number, modified: Date, etag: string, contentType: string}>} File metadata
   */
  async getMetadata(path) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.client.send(command);

      return {
        size: response.ContentLength,
        modified: response.LastModified,
        etag: response.ETag?.replace(/"/g, ''),
        contentType: response.ContentType,
      };
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  /**
   * Copies a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${source}`,
        Key: destination,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Moves/renames a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    try {
      // Copy to new location
      await this.copy(source, destination);

      // Delete original
      await this.delete(source);

      return true;
    } catch (error) {
      throw new Error(`Failed to move file: ${error.message}`);
    }
  }

  /**
   * Creates a directory (no-op for S3, but validates path)
   * @param {string} dirPath - Directory path
   * @returns {Promise<boolean>} Success status
   */
  async createDirectory(dirPath) {
    try {
      // Ensure path ends with trailing slash
      const normalizedPath = dirPath.endsWith('/') ? dirPath : `${dirPath}/`;

      // Create an empty object with the directory name
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: normalizedPath,
        Body: '',
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }
}
