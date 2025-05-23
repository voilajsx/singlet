/**
 * @voilajs/appkit - Base storage provider
 * @module @voilajs/appkit/storage/providers/base
 */

/**
 * Base storage provider interface
 */
export class StorageProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Uploads a file
   * @param {Buffer|Stream} file - File content
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, etag?: string}>} Upload result
   */
  async upload(file, path, options = {}, onProgress = null) {
    throw new Error('upload() must be implemented by subclass');
  }

  /**
   * Uploads a large file using multipart upload
   * @param {Buffer|Stream|string} file - File content or path to file
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, etag?: string}>} Upload result
   */
  async uploadLarge(file, path, options = {}, onProgress = null) {
    throw new Error('uploadLarge() must be implemented by subclass');
  }

  /**
   * Downloads a file
   * @param {string} path - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async download(path) {
    throw new Error('download() must be implemented by subclass');
  }

  /**
   * Downloads a file as a stream
   * @param {string} path - Storage path
   * @returns {Promise<Stream>} Readable stream
   */
  async downloadStream(path) {
    throw new Error('downloadStream() must be implemented by subclass');
  }

  /**
   * Deletes a file
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(path) {
    throw new Error('delete() must be implemented by subclass');
  }

  /**
   * Gets a file URL
   * @param {string} path - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(path, options = {}) {
    throw new Error('getUrl() must be implemented by subclass');
  }

  /**
   * Checks if a file exists
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(path) {
    throw new Error('exists() must be implemented by subclass');
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @param {Object} [options] - List options
   * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
   */
  async list(prefix = '', options = {}) {
    throw new Error('list() must be implemented by subclass');
  }

  /**
   * Gets file metadata
   * @param {string} path - Storage path
   * @returns {Promise<{size: number, modified: Date, etag?: string, contentType?: string}>} File metadata
   */
  async getMetadata(path) {
    throw new Error('getMetadata() must be implemented by subclass');
  }

  /**
   * Copies a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    throw new Error('copy() must be implemented by subclass');
  }

  /**
   * Moves/renames a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    throw new Error('move() must be implemented by subclass');
  }

  /**
   * Creates a directory
   * @param {string} path - Directory path
   * @returns {Promise<boolean>} Success status
   */
  async createDirectory(path) {
    throw new Error('createDirectory() must be implemented by subclass');
  }

  /**
   * Detects content type from file extension
   * @param {string} path - File path
   * @returns {string} Content type
   */
  detectContentType(path) {
    const extension = path.split('.').pop().toLowerCase();

    const mimeTypes = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',

      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Web
      html: 'text/html',
      htm: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      xml: 'application/xml',

      // Text
      txt: 'text/plain',
      md: 'text/markdown',
      csv: 'text/csv',

      // Archives
      zip: 'application/zip',
      rar: 'application/vnd.rar',
      tar: 'application/x-tar',
      gz: 'application/gzip',

      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',

      // Video
      mp4: 'video/mp4',
      webm: 'video/webm',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',

      // Fonts
      ttf: 'font/ttf',
      otf: 'font/otf',
      woff: 'font/woff',
      woff2: 'font/woff2',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}
