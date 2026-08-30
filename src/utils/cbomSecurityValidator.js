/**
 * quantavault_front/src/cbom/utils/securityValidator.js
 * 
 * Commercial-grade security validator for CBOM codebase uploads.
 * Enforces:
 * - Allowed source code & config extension whitelisting
 * - Dangerous executable & binary blacklist filtering (.exe, .dll, .so, .bat, etc.)
 * - Size limits (100 MB total, 10 MB per-file, 5000 max files)
 * - Path traversal sanitization (stripping ../, ../)
 */

export const MAX_TOTAL_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_SINGLE_FILE_BYTES = 10 * 1024 * 1024;  // 10 MB
export const MAX_FILE_COUNT = 5000;

// Whitelisted Source Code & Manifest Extensions
export const ALLOWED_EXTENSIONS = new Set([
  // Source Code
  '.go', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.pyw', '.java', '.rs', '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp',
  '.cs', '.rb', '.php', '.sol', '.kt', '.scala', '.swift', '.dart', '.lua',
  // Configs & Project Manifests
  '.json', '.yaml', '.yml', '.toml', '.xml', '.conf', '.ini', '.properties',
  '.env.example', '.env.template', '.gitignore',
  // Cryptographic Certificates, Keys & Keystores
  '.pem', '.crt', '.cer', '.key', '.csr', '.der', '.p12', '.pfx', '.jks',
  '.pub', '.kdbx', '.asc', '.sig'
]);

// Named Whitelist Files (without extensions or exact base names)
export const ALLOWED_FILENAMES = new Set([
  'dockerfile', 'containerfile', 'makefile', 'gemfile', 'procfile',
  'go.mod', 'go.sum', 'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'cargo.toml', 'cargo.lock', 'pom.xml', 'build.gradle', 'build.gradle.kts',
  'requirements.txt', 'pipfile', 'pipfile.lock', 'pyproject.toml', 'setup.py',
  'composer.json', 'composer.lock', 'cmakelists.txt'
]);

// Strictly Blocked Executable & Dangerous Formats
export const BLOCKED_DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.bin', '.msi', '.iso', '.img',
  '.bat', '.cmd', '.ps1', '.vbs', '.vbe', '.wsf', '.wsh', '.scr',
  '.com', '.pif', '.hta', '.cpl', '.msc', '.jar', '.war', '.class',
  '.pyc', '.pyo', '.pyd', '.elf', '.o', '.a', '.lib'
]);

// Ignored/Excluded build and VCS directories
export const EXCLUDED_DIRECTORIES = [
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'bin', 'obj',
  'packages', '__pycache__', 'venv', '.venv', 'env', '.pytest_cache',
  'target', '.idea', '.vscode', '.next', '.nuxt', 'coverage'
];

/**
 * Normalizes and sanitizes file paths to prevent Path Traversal attacks.
 */
export function sanitizeRelativePath(rawPath) {
  if (!rawPath) return 'unknown_file';
  // Replace backslashes with forward slashes
  let sanitized = rawPath.replace(/\\/g, '/');
  // Remove path traversal sequences (../, ./)
  sanitized = sanitized.replace(/\.\.+[\/\\]/g, '');
  // Strip leading slashes
  sanitized = sanitized.replace(/^\/+/, '');
  return sanitized;
}

/**
 * Checks if path belongs to an excluded directory.
 */
export function isExcludedDirectoryPath(path) {
  const normalized = path.replace(/\\/g, '/').toLowerCase();
  const parts = normalized.split('/');
  return parts.some(part => EXCLUDED_DIRECTORIES.includes(part));
}

/**
 * Validates a list of files dropped or selected in the browser.
 * Returns { validFiles, skippedFiles, blockedFiles, totalBytes, error }
 */
export function validateUploadFiles(rawFiles) {
  const filesArray = Array.from(rawFiles || []);
  if (filesArray.length === 0) {
    return { error: 'No files provided for scan.' };
  }

  const validFiles = [];
  const skippedFiles = [];
  const blockedFiles = [];
  let totalBytes = 0;

  for (const file of filesArray) {
    const rawPath = file.webkitRelativePath || file.name;
    const sanitizedPath = sanitizeRelativePath(rawPath);

    // 1. Exclude noisy vendor/build dirs
    if (isExcludedDirectoryPath(rawPath)) {
      skippedFiles.push({ name: sanitizedPath, reason: 'Excluded build/dependency folder' });
      continue;
    }

    const lowerName = sanitizedPath.toLowerCase();
    const baseName = lowerName.split('/').pop();
    const ext = baseName.includes('.') ? '.' + baseName.split('.').pop() : '';

    // 2. Check for dangerous blocked executables
    if (BLOCKED_DANGEROUS_EXTENSIONS.has(ext)) {
      blockedFiles.push({ name: sanitizedPath, reason: `Dangerous binary format (${ext}) blocked` });
      continue;
    }

    // 3. Check individual file size limit (10 MB)
    if (file.size > MAX_SINGLE_FILE_BYTES) {
      skippedFiles.push({ name: sanitizedPath, reason: `File size exceeds 10 MB single-file limit` });
      continue;
    }

    // 4. Check whitelisted code/config formats
    const isAllowed = ALLOWED_EXTENSIONS.has(ext) || ALLOWED_FILENAMES.has(baseName);
    if (!isAllowed) {
      skippedFiles.push({ name: sanitizedPath, reason: `Non-source file type (${ext || 'no-ext'})` });
      continue;
    }

    totalBytes += file.size;
    validFiles.push(file);
  }

  // Enforce total size cap (100 MB)
  if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return {
      error: `Total upload size (${(totalBytes / (1024 * 1024)).toFixed(1)} MB) exceeds commercial 100 MB limit. Please exclude large dependencies or media files.`,
      validFiles: [],
      blockedFiles,
      skippedFiles
    };
  }

  // Enforce max file count cap (5000 files)
  if (validFiles.length > MAX_FILE_COUNT) {
    return {
      error: `Project contains ${validFiles.length} source files, which exceeds the max 5,000 files limit.`,
      validFiles: [],
      blockedFiles,
      skippedFiles
    };
  }

  if (validFiles.length === 0) {
    let msg = 'No valid source code or configuration files found in selected directory.';
    if (blockedFiles.length > 0) {
      msg += ` ${blockedFiles.length} executable/binary files were blocked for security.`;
    }
    return { error: msg, validFiles: [], blockedFiles, skippedFiles };
  }

  return {
    validFiles,
    skippedFiles,
    blockedFiles,
    totalBytes,
    error: null
  };
}
