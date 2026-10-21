import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

const validCourse = {
  name: 'NestJS Fundamentals',
  code: 'CS101',
  instructor: 'John Doe',
  credits: 3,
  description: 'Introduction to NestJS',
};

describe('Course API (e2e)', () => {
  let app: INestApplication<App>;
  const uploadedFiles = new Set<string>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    // Remove only paths returned by this suite's successful uploads.
    for (const file of uploadedFiles) {
      await rm(file, { force: true });
    }
    uploadedFiles.clear();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /course returns the JSON course list', async () => {
    await request(app.getHttpServer()).get('/course').expect(200).expect({
      message: 'All courses fetched successfully',
      data: [],
    });
  });

  it('GET /course/5 returns the JSON course ID', async () => {
    await request(app.getHttpServer()).get('/course/5').expect(200).expect({
      message: 'Course fetched successfully',
      id: '5',
    });
  });

  it('POST /course returns the validated course as JSON', async () => {
    await request(app.getHttpServer())
      .post('/course')
      .send(validCourse)
      .expect(201)
      .expect({ message: 'Course created successfully', data: validCourse });
  });

  it('PUT /course/5 accepts a partial DTO and returns the updated data', async () => {
    const update = { name: 'NestJS Advanced', code: 'CS201' };

    await request(app.getHttpServer())
      .put('/course/5')
      .send(update)
      .expect(200)
      .expect({
        message: 'Course updated successfully',
        id: '5',
        data: update,
      });
  });

  it('PATCH /course/5 reports only the supplied fields', async () => {
    await request(app.getHttpServer())
      .patch('/course/5')
      .send({ name: 'NestJS Advanced', credits: 4 })
      .expect(200)
      .expect({
        message: 'Course patched successfully',
        id: '5',
        updatedFields: ['name', 'credits'],
      });
  });

  it('DELETE /course/5 returns the JSON success response', async () => {
    await request(app.getHttpServer()).delete('/course/5').expect(200).expect({
      message: 'Course deleted successfully',
      id: '5',
    });
  });

  const invalidRequests = [
    {
      label: 'an empty name',
      method: 'post',
      path: '/course',
      body: { ...validCourse, name: '' },
      errors: ['name should not be empty'],
    },
    {
      label: 'a whitespace-only name',
      method: 'post',
      path: '/course',
      body: { ...validCourse, name: '   ' },
      errors: ['name should not be blank'],
    },
    {
      label: 'credits above 6',
      method: 'post',
      path: '/course',
      body: { ...validCourse, credits: 10 },
      errors: ['credits must not be greater than 6'],
    },
    {
      label: 'credits below 1',
      method: 'post',
      path: '/course',
      body: { ...validCourse, credits: 0 },
      errors: ['credits must not be less than 1'],
    },
    {
      label: 'missing required fields',
      method: 'post',
      path: '/course',
      body: {},
      errors: [
        'name should not be empty',
        'code should not be empty',
        'instructor should not be empty',
        'credits must be a number',
      ],
    },
    {
      label: 'an unknown property',
      method: 'post',
      path: '/course',
      body: { ...validCourse, unexpected: true },
      errors: ['property unexpected should not exist'],
    },
    {
      label: 'a nonstring instructor',
      method: 'post',
      path: '/course',
      body: { ...validCourse, instructor: 123 },
      errors: ['instructor must be a string'],
    },
    {
      label: 'nonnumeric credits',
      method: 'post',
      path: '/course',
      body: { ...validCourse, credits: 'abc' },
      errors: ['credits must be a number'],
    },
    {
      label: 'invalid credits in a partial update',
      method: 'patch',
      path: '/course/5',
      body: { credits: 10 },
      errors: ['credits must not be greater than 6'],
    },
  ] as const;

  it.each(invalidRequests)('rejects $label with HTTP 400', async (testCase) => {
    const response = await request(app.getHttpServer())
      [testCase.method](testCase.path)
      .send(testCase.body)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining(
        testCase.errors.map((error) => expect.stringContaining(error)),
      ),
    });
  });

  it('transforms numeric string credits into a number', async () => {
    await request(app.getHttpServer())
      .post('/course')
      .send({ ...validCourse, credits: '3' })
      .expect(201)
      .expect({ message: 'Course created successfully', data: validCourse });
  });

  it('accepts a create request without the optional description', async () => {
    const { description: _description, ...course } = validCourse;

    await request(app.getHttpServer())
      .post('/course')
      .send(course)
      .expect(201)
      .expect({ message: 'Course created successfully', data: course });
  });

  it('allows all fields to be omitted in PUT', async () => {
    await request(app.getHttpServer())
      .put('/course/5')
      .send({})
      .expect(200)
      .expect({ message: 'Course updated successfully', id: '5', data: {} });
  });

  it('allows all fields to be omitted in PATCH', async () => {
    await request(app.getHttpServer())
      .patch('/course/5')
      .send({})
      .expect(200)
      .expect({
        message: 'Course patched successfully',
        id: '5',
        updatedFields: [],
      });
  });

  it.each(['jpg', 'jpeg', 'png', 'pdf', 'PDF'])(
    'accepts a .%s upload and saves its contents under src/uploads',
    async (extension) => {
      const fixtureExtension =
        extension === 'jpeg' ? 'jpg' : extension.toLowerCase();
      const contents = await readFile(
        new URL(
          `./fixtures/course-material.${fixtureExtension}`,
          import.meta.url,
        ),
      );
      const response = await request(app.getHttpServer())
        .post('/course/5/upload')
        .attach('file', contents, `course-material.${extension}`)
        .expect(201);

      expect(response.body.path).toMatch(/^src\/uploads\/[^/]+$/);
      const uploadedPath = resolve(response.body.path as string);
      uploadedFiles.add(uploadedPath);

      expect(response.body).toEqual({
        message: 'Material uploaded successfully',
        courseId: '5',
        filename: expect.stringMatching(
          new RegExp(`^\\d+-[a-f0-9-]{36}\\.${extension.toLowerCase()}$`),
        ),
        path: `src/uploads/${response.body.filename}`,
      });
      expect(await readFile(uploadedPath)).toEqual(contents);
    },
  );

  it.each(['txt', 'exe'])(
    'rejects a .%s upload with HTTP 400',
    async (extension) => {
      const response = await request(app.getHttpServer())
        .post('/course/5/upload')
        .attach(
          'file',
          Buffer.from('Unsupported course material'),
          `notes.${extension}`,
        )
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Only .jpg, .jpeg, .png and .pdf files are allowed',
      });
    },
  );

  it('rejects an allowed extension larger than 2 MiB with HTTP 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/course/5/upload')
      .attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), 'too-large.pdf')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'File must be smaller than 2 MB',
    });
  });

  it('rejects a missing upload with HTTP 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/course/5/upload')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'File is required',
    });
  });
});
