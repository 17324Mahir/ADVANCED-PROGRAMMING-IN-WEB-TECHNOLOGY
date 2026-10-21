# Postman checks

Import `NestJS-Lab-Task-02.postman_collection.json` as **NestJS Lab Task 02**.
The collection defaults to `baseUrl = http://localhost:3000` and `courseId = 5`.
Its 24 requests cover the six JSON routes, nine validation failures, numeric
string transformation, all four accepted upload extensions, and four upload
failures. Each request checks the status and relevant JSON response fields.

Start the API, then generate disposable upload fixtures from the project folder:

```sh
FIXTURES_DIR="$(node postman/generate-fixtures.mjs)"
```

The script prints a temporary working directory containing `fixtures/`. The
successful PDF is a readable one-page PDF; the PNG and both JPEG files are valid
one-pixel images. `too-large.pdf` is 3 MB. `invalid.exe` contains harmless text.
No generated fixtures are added to the repository.

For the Postman desktop app, set its working directory to the printed temporary
directory and allow local file access. If the app asks you to select a local
file again after import, choose the matching file inside its `fixtures` folder.
Keep the upload body in **form-data**, with the **file** row set to **File**;
let Postman set the multipart Content-Type header and boundary.

To execute the full collection with Newman:

```sh
npx --yes newman run postman/NestJS-Lab-Task-02.postman_collection.json \
  --working-dir "$FIXTURES_DIR"
```

The API returns sample JSON responses and does not persist course records, so
the requests can be repeated and the list response remains `data: []`. Accepted
uploads are written to `src/uploads/`; inspect that directory after the upload
requests. Delete the generated temporary directory when it is no longer needed.
