# NestJS Lab Task 02 — Course Management API

This submission extends Lab Task 01 with DTO validation, JSON responses, and course material uploads. It uses NestJS 12 with ESM and `.js` endings on local TypeScript imports.

## Run

From this `course-management-api` directory:

```bash
npm ci
npm run start:dev
```

The API listens at `http://localhost:3000`. Set `PORT` to use another port.

## Course routes

| Method | Route                | Response                                                  |
| ------ | -------------------- | --------------------------------------------------------- |
| GET    | `/course`            | Success message and `data: []`                            |
| GET    | `/course/:id`        | Success message and `id`                                  |
| POST   | `/course`            | Success message and validated `data` (201)                |
| PUT    | `/course/:id`        | Success message, `id`, and validated `data`               |
| PATCH  | `/course/:id`        | Success message, `id`, and `updatedFields`                |
| DELETE | `/course/:id`        | Success message and `id`                                  |
| POST   | `/course/:id/upload` | Success message, `courseId`, `filename`, and `path` (201) |

This lab returns the specified response objects without storing course records, so the all-courses list remains empty.

Create a course with a JSON body:

```json
{
  "name": "NestJS Fundamentals",
  "code": "CS101",
  "instructor": "John Doe",
  "credits": 3,
  "description": "Introduction to NestJS"
}
```

`name`, `code`, and `instructor` are required strings and cannot be blank. `credits` must be a number from 1 to 6; numeric strings such as `"3"` are converted to numbers. `description` is optional. Unknown properties return HTTP 400. PUT and PATCH use `UpdateCourseDto`, which makes all fields optional and retains validation for supplied fields.

For uploads, send multipart form-data using the field `file`. Allowed extensions are `.jpg`, `.jpeg`, `.png`, and `.pdf`, with a 2 MiB limit. Extension, size, and missing-file errors return HTTP 400. Files receive generated filenames and are stored in `src/uploads/`, which Git ignores. The lab checks extensions rather than file contents.

## Verify

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

The HTTP tests cover the JSON routes, invalid request bodies, numeric transformation, partial updates, successful uploads, saved file contents, and upload failures. Test uploads are removed after verification.

## Postman collection

Import [`postman/NestJS-Lab-Task-02.postman_collection.json`](postman/NestJS-Lab-Task-02.postman_collection.json) into Postman. The collection is named **NestJS Lab Task 02** and uses `baseUrl` (`http://localhost:3000`) and `courseId` (`5`). It includes response assertions for the walkthrough's success and failure cases.

Generate disposable upload fixtures outside the repository:

```bash
node postman/generate-fixtures.mjs
```

The command prints a temporary working directory containing `fixtures/`. Use that directory as Postman's working directory, or choose its corresponding file for each upload request. Let Postman generate the multipart Content-Type header.

With the API running, the same collection can be run through Postman's Newman CLI:

```bash
LAB02_FIXTURES_DIR=$(node postman/generate-fixtures.mjs)
npx --yes newman run postman/NestJS-Lab-Task-02.postman_collection.json --working-dir "$LAB02_FIXTURES_DIR"
```

Successful manual or collection uploads remain in `src/uploads/` until removed locally.
