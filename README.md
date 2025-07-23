# Shairport Sync Metadata Parser

A simple Node.js (TypeScript) library to parse metadata from [Shairport Sync](https://github.com/mikebrady/shairport-sync).

This library reads the XML-like metadata stream from standard input, parses it, and emits structured data objects as an RxJS `Observable`. It is designed to be used in a pipeline with `shairport-sync`.

This program was originally created by the Gemini CLI, with reference to the C implementation of [shairport-sync-metadata-reader](https://github.com/mikebrady/shairport-sync-metadata-reader).

## Features

-   Parses `shairport-sync` metadata from a standard input stream.
-   Handles multi-line XML items and Base64 encoded data.
-   Provides a clean, easy-to-use RxJS `Observable` interface.
-   Lightweight and has only one dependency (`rxjs`).

## Installation

Once published to npm:
```bash
npm install @minoruta/parse-shairport
```

For now, install directly from GitHub:
```bash
npm install git+https://github.com/minoruta/parse-shairport.git
```

## Usage

Create a script (e.g., `my-player.js`) to import and use the parser.

```typescript
// my-player.ts
import { parseMetadata, Metadata } from '@minoruta/parse-shairport';

console.log('Metadata parser is running, waiting for data from stdin...');

parseMetadata().subscribe({
  next: (metadata: Metadata) => {
    // Now you can use the structured metadata object
    console.log(metadata);

    // Example: Display track information
    if (metadata.type === 'artist') {
      console.log(`--> Artist: ${metadata.payload}`);
    }
    if (metadata.type === 'title') {
      console.log(`--> Title: ${metadata.payload}`);
    }
  },
  error: (err) => {
    // Errors can occur due to:
    // - Invalid XML format in the metadata stream
    // - Unexpected data encoding issues
    // - stdin stream interruption
    console.error('A critical error occurred in the metadata stream:', err);
  },
  complete: () => {
    console.log('The metadata stream has ended.');
  },
});
```

### Piping from Shairport Sync

To make this work with `shairport-sync`, you need to configure `shairport-sync` to output its metadata to standard output and then pipe it to your Node.js script.

```bash
ts-node my-player.ts < /tmp/shairport-sync-metadata
```

or

```bash
shairport-sync --metadata-pipename=/dev/stdout | ts-node my-player.ts
```

## API

### `parseMetadata(): Observable<Metadata>`

This is the main function of the library. It takes no arguments.

-   **Returns**: An `Observable` that emits `Metadata` objects.
    -   It emits a `next` notification for each piece of metadata parsed from `process.stdin`.
    -   It emits an `error` notification if there is an error reading the stream.
    -   It emits a `complete` notification when the `stdin` stream is closed.

### `Metadata` Interface

The `Metadata` object emitted by the `Observable` has the following structure:

```typescript
interface Metadata {
  type: MetadataType;
  payload: string;
}

// Currently supported metadata types
// Note: Additional types may be added in future versions
type MetadataType = 'album' | 'title' | 'artist' | 'session-begin' | 'session-end';
```

-   `type`: The type of the metadata.
-   `payload`: The string content of the metadata. For `session-begin` and `session-end`, this will be an empty string.

## Development

To work on this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/minoruta/parse-shairport.git
    cd parse-shairport
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run example:**
    You can also run the example script directly to see how it works:
    ```bash
    npm run example
    ```
