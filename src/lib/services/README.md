# FileSystem Service Documentation

## Overview

This FileSystem service provides a unified interface for file operations across multiple storage backends:
- **OPFS** (Origin Private File System) for browsers without File System API
- **Browser File System API** for modern browsers (Chrome, Edge)
- **Tauri v2 File System API** for desktop applications

## Architecture

### Core Components

1. **FileSystem Interface** (`interface.ts`) - Unified interface for all implementations
2. **Context Detection** (`utils/context.ts`) - Runtime environment detection
3. **Implementations** - Backend-specific implementations
4. **Factory** (`factory.ts`) - Creates appropriate FileSystem instances
5. **Note Service** (`notes/service.ts`) - Higher-order service using FileSystem

### Error Handling

All operations use `neverthrow` for robust error handling. No exceptions are thrown - all errors are returned as `Result` types.

## Usage Examples

### Basic FileSystem Usage

```typescript
import { createFileSystem, createFileSystemWithFallback } from '$lib/services';

// Auto-detect and create appropriate FileSystem
const fs = createFileSystemWithFallback();

// Write a file
const writeResult = await fs.writeFile('notes/my-note.md', '# Hello World');
if (writeResult.isErr()) {
  console.error('Write failed:', writeResult.error);
  return;
}

// Read a file
const readResult = await fs.readFile('notes/my-note.md');
if (readResult.isErr()) {
  console.error('Read failed:', readResult.error);
  return;
}
console.log('Content:', readResult.value);

// List files
const listResult = await fs.listFiles();
if (listResult.isOk()) {
  console.log('Files:', listResult.value);
}
```

### Note Service Usage

```typescript
import { createFileSystemWithFallback, createNoteService } from '$lib/services';

// Create FileSystem and Note service
const fs = createFileSystemWithFallback();
const noteService = createNoteService(fs);

// Create a note
const createResult = await noteService.create({
  filename: 'my-first-note.md',
  content: '# My First Note\n\nThis is the content.',
  metadata: { tags: ['personal', 'draft'] }
});

if (createResult.isErr()) {
  console.error('Failed to create note:', createResult.error);
  return;
}

const note = createResult.value;
console.log('Created note:', note);

// List all notes
const listResult = await noteService.list();
if (listResult.isOk()) {
  console.log('All notes:', listResult.value);
}

// Update a note
const updateResult = await noteService.update(note.id, {
  content: '# Updated Note\n\nThis content has been updated.',
  metadata: { tags: ['personal', 'published'] }
});

// Search notes
const searchResult = await noteService.search('updated');
if (searchResult.isOk()) {
  console.log('Search results:', searchResult.value);
}
```

### Context-Specific Usage

```typescript
import { 
  createFileSystem, 
  FileSystemContext, 
  getFileSystemCapabilities 
} from '$lib/services';

// Check capabilities
const capabilities = getFileSystemCapabilities();
console.log('Available:', capabilities);

// Force specific implementation
if (capabilities.browserFS) {
  const fs = createFileSystem(FileSystemContext.BROWSER_FS);
  // Use Browser FS API
}

// Tauri with custom base path
if (capabilities.tauri) {
  const fs = createFileSystem(FileSystemContext.TAURI, {
    basePath: '/Users/username/Documents/Notes'
  });
}
```

### Error Handling Patterns

```typescript
import { createNoteService, createFileSystemWithFallback } from '$lib/services';

const fs = createFileSystemWithFallback();
const noteService = createNoteService(fs);

// Pattern 1: Early return on error
const result = await noteService.get('note-id');
if (result.isErr()) {
  switch (result.error.type) {
    case 'NOTE_NOT_FOUND':
      console.log('Note not found');
      break;
    case 'FILE_NOT_FOUND':
      console.log('File system error');
      break;
    default:
      console.error('Unknown error:', result.error);
  }
  return;
}

// Pattern 2: Chain operations
const chainResult = await noteService.get('note-id')
  .andThen(note => noteService.update(note.id, { content: 'Updated!' }))
  .andThen(updatedNote => noteService.list());

// Pattern 3: Handle with fallback
const noteWithFallback = await noteService.get('note-id')
  .orElse(() => noteService.create({
    filename: 'default-note.md',
    content: 'Default content'
  }));
```

### XState Integration

```typescript
import { fromPromise } from 'xstate';
import { createFileSystemWithFallback, createNoteService } from '$lib/services';

const fs = createFileSystemWithFallback();
const noteService = createNoteService(fs);

// XState actor for loading notes
export const loadNotesActor = fromPromise(async () => {
  const result = await noteService.list();
  
  if (result.isErr()) {
    throw new Error(`Failed to load notes: ${result.error.message}`);
  }
  
  return result.value;
});

// XState actor for saving a note
export const saveNoteActor = fromPromise(async ({ input }: { 
  input: { id?: string; filename: string; content: string } 
}) => {
  const { id, filename, content } = input;
  
  const result = id 
    ? await noteService.update(id, { content })
    : await noteService.create({ filename, content });
  
  if (result.isErr()) {
    throw new Error(`Failed to save note: ${result.error.message}`);
  }
  
  return result.value;
});
```

## API Reference

### FileSystem Interface

```typescript
interface FileSystem {
  writeFile(path: string, content: string): ResultAsync<void, FileSystemError>;
  readFile(path: string): ResultAsync<string, FileSystemError>;
  exists(path: string): ResultAsync<boolean, FileSystemError>;
  deleteFile(path: string): ResultAsync<void, FileSystemError>;
  listFiles(path?: string): ResultAsync<FileMetadata[], FileSystemError>;
  createDirectory?(path: string): ResultAsync<void, FileSystemError>;
  getMetadata?(path: string): ResultAsync<FileMetadata, FileSystemError>;
}
```

### Note Service Interface

```typescript
interface NoteService {
  create(data: CreateNoteData): ResultAsync<Note, NoteServiceError>;
  get(id: string): ResultAsync<Note, NoteServiceError>;
  getByFilename(filename: string): ResultAsync<Note, NoteServiceError>;
  update(id: string, data: UpdateNoteData): ResultAsync<Note, NoteServiceError>;
  delete(id: string): ResultAsync<void, NoteServiceError>;
  list(): ResultAsync<Note[], NoteServiceError>;
  exists(id: string): ResultAsync<boolean, NoteServiceError>;
  existsByFilename(filename: string): ResultAsync<boolean, NoteServiceError>;
  search?(query: string): ResultAsync<Note[], NoteServiceError>;
}
```

## Error Types

### FileSystem Errors
- `FILE_NOT_FOUND` - File does not exist
- `FILE_ALREADY_EXISTS` - File already exists when creating
- `PERMISSION_DENIED` - Insufficient permissions
- `QUOTA_EXCEEDED` - Storage quota exceeded
- `INVALID_PATH` - Invalid file path
- `NETWORK_ERROR` - Network-related error
- `UNKNOWN_ERROR` - Unexpected error

### Note Service Errors
- `NOTE_NOT_FOUND` - Note with given ID not found
- `INVALID_NOTE_DATA` - Invalid note data provided
- `NOTE_ALREADY_EXISTS` - Note with filename already exists

## Best Practices

1. **Always handle errors** - Use neverthrow patterns for robust error handling
2. **Use higher-order functions** - Create services with FileSystem dependency injection
3. **Validate inputs** - Check filenames and paths before operations
4. **Batch operations** - Use `ResultAsync.combine()` for multiple operations
5. **Provide fallbacks** - Use `createFileSystemWithFallback()` for automatic detection
6. **Test with mocks** - FileSystem interface enables easy testing

## Testing

```typescript
// Mock FileSystem for testing
class MockFileSystem implements FileSystem {
  private files = new Map<string, string>();
  
  writeFile(path: string, content: string) {
    this.files.set(path, content);
    return ok(undefined);
  }
  
  readFile(path: string) {
    const content = this.files.get(path);
    return content 
      ? ok(content)
      : err(createFileSystemError.fileNotFound(path));
  }
  
  // ... implement other methods
}

// Use in tests
const mockFs = new MockFileSystem();
const noteService = createNoteService(mockFs);
```