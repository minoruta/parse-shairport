/*
 * This program was created by Gemini CLI, referencing shairport-sync-metadata-reader.
 * https://github.com/mikebrady/shairport-sync-metadata-reader
 */
import { Observable } from 'rxjs';

export type MetadataType = 'album' | 'title' | 'artist' | 'session-begin' | 'session-end';
export interface Metadata {
  type: MetadataType;
  payload: string;
}

/**
 * Parses XML metadata from a string and returns the metadata object and the number of
 * characters consumed. The XML is expected to be in the format used by shairport-sync.
 *
 * @param {string} xml - The XML string to parse.
 * @returns {{ metadata: Metadata | null, consumed: number }}
 *      An object containing the parsed metadata and the number of characters consumed.
 */
function parseXml(xml: string): { metadata: Metadata | null, consumed: number } {
  const itemEndTag = '</item>';
  const endTagIndex = xml.indexOf(itemEndTag);

  if (endTagIndex === -1) {
    return { metadata: null, consumed: 0 };
  }

  const consumed = endTagIndex + itemEndTag.length;
  const itemContent = xml.substring(xml.indexOf('<item>') + 6, endTagIndex);

  const codeMatch = itemContent.match(/<code>([0-9a-fA-F]+)<\/code>/);
  if (!codeMatch) return { metadata: null, consumed };

  const code = Buffer.from(codeMatch[1], 'hex').toString();

  let metadataType: MetadataType | undefined;
  switch (code) {
    case 'asal': metadataType = 'album'; break;
    case 'minm': metadataType = 'title'; break;
    case 'asar': metadataType = 'artist'; break;
    case 'pend': metadataType = 'session-end'; break;
    case 'pbeg': metadataType = 'session-begin'; break;
    default: return { metadata: null, consumed };
  }

  let payload = '';
  const lengthMatch = itemContent.match(/<length>(\d+)<\/length>/);
  if (lengthMatch && parseInt(lengthMatch[1], 10) > 0) {
    const dataMatch = itemContent.match(/<data encoding="base64">\s*([\s\S]*?)\s*<\/data>/);
    if (dataMatch && dataMatch[1]) {
      payload = Buffer.from(dataMatch[1].trim(), 'base64').toString('utf8');
    }
  }

  return { metadata: { type: metadataType, payload }, consumed };
}

/**
 * Parses metadata from stdin and emits it as an Observable.
 * The metadata is expected to be in XML format as used by shairport-sync.
 *
 * @returns {Observable<Metadata>} An observable that emits parsed metadata items.
 */
export function parseMetadata(): Observable<Metadata> {
  return new Observable(subscriber => {
    let buffer = '';

    const processBuffer = () => {
      while (true) {
        const { metadata, consumed } = parseXml(buffer);
        if (metadata) {
          subscriber.next(metadata);
        }
        if (consumed > 0) {
          buffer = buffer.substring(consumed);
        } else {
          break;
        }
      }
    };

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      processBuffer();
    });

    process.stdin.on('end', () => {
      subscriber.complete();
    });

    process.stdin.on('error', (err) => {
      subscriber.error(err);
    });

    return () => {
      // Cleanup not strictly necessary for stdin, but good practice
    };
  });
}
