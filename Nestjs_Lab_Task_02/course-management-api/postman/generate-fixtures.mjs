import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Keep disposable upload data outside the repository, including the 3 MB case.
const workingDirectory = await mkdtemp(join(tmpdir(), 'nestjs-lab02-postman-'));
const fixturesDirectory = join(workingDirectory, 'fixtures');
await mkdir(fixturesDirectory);

// A complete one-page PDF, with byte offsets calculated for its cross-reference
// table. This is an actual readable PDF for the successful upload request.
const content = 'BT /F1 18 Tf 50 750 Td (NestJS Lab Task 02 upload fixture) Tj ET\n';
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
];
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (const [index, object] of objects.entries()) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
}
const crossReferenceOffset = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) {
  pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF\n`;

// Valid one-pixel PNG and JPEG images; the JPEG bytes also serve the .jpeg case.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC',
  'base64',
);
const jpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAASABIAAD/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwACAgICAgIDAgIDBQMDAwUGBQUFBQYIBgYGBgYICggICAgICAoKCgoKCgoKDAwMDAwMDg4ODg4PDw8PDw8PDw8P/9sAQwECAgIEBAQHBAQHEAsJCxAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ/90ABAAB/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
  'base64',
);
const oversizedPdf = Buffer.alloc(3 * 1024 * 1024, ' ');
oversizedPdf.write(pdf);

await Promise.all([
  writeFile(join(fixturesDirectory, 'course-material.pdf'), pdf),
  writeFile(join(fixturesDirectory, 'course-material.png'), png),
  writeFile(join(fixturesDirectory, 'course-material.jpg'), jpeg),
  writeFile(join(fixturesDirectory, 'course-material.jpeg'), jpeg),
  writeFile(join(fixturesDirectory, 'invalid.txt'), 'Unsupported text upload.\n'),
  // Harmless text, not an executable program; only its extension is being tested.
  writeFile(join(fixturesDirectory, 'invalid.exe'), 'Unsupported extension fixture.\n'),
  writeFile(join(fixturesDirectory, 'too-large.pdf'), oversizedPdf),
]);

// Output only the directory so this script can be used in shell substitution.
console.log(workingDirectory);
