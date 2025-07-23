import { parseMetadata } from '../src';

console.log('Starting metadata parser, waiting for stdin...');

parseMetadata().subscribe({
  next: (metadata) => console.log(metadata),
  error: (err) => console.error('An error occurred:', err),
  complete: () => console.log('Stdin stream ended.'),
});
