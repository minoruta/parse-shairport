import { Observable } from 'rxjs';
export type MetadataType = 'album' | 'title' | 'artist' | 'session-begin' | 'session-end';
export interface Metadata {
    type: MetadataType;
    payload: string;
}
/**
 * Parses metadata from stdin and emits it as an Observable.
 * The metadata is expected to be in XML format as used by shairport-sync.
 *
 * @returns {Observable<Metadata>} An observable that emits parsed metadata items.
 */
export declare function parseMetadata(): Observable<Metadata>;
//# sourceMappingURL=index.d.ts.map