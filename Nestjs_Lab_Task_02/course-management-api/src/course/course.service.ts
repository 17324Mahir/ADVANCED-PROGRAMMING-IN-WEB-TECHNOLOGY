import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import type { CreateCourseDto } from './dto/create-course.dto.js';
import type { UpdateCourseDto } from './dto/update-course.dto.js';

@Injectable()
export class CourseService {
  getAllCourses() {
    return {
      message: 'All courses fetched successfully',
      data: [],
    };
  }

  getCourseById(id: string) {
    return {
      message: 'Course fetched successfully',
      id,
    };
  }

  createCourse(dto: CreateCourseDto) {
    return {
      message: 'Course created successfully',
      data: dto,
    };
  }

  updateCourse(id: string, dto: UpdateCourseDto) {
    return {
      message: 'Course updated successfully',
      id,
      data: dto,
    };
  }

  patchCourse(id: string, dto: UpdateCourseDto) {
    return {
      message: 'Course patched successfully',
      id,
      updatedFields: Object.keys(dto).filter(
        (key) => dto[key as keyof UpdateCourseDto] !== undefined,
      ),
    };
  }

  deleteCourse(id: string) {
    return {
      message: 'Course deleted successfully',
      id,
    };
  }

  uploadCourseMaterial(id: string, file: Express.Multer.File) {
    return {
      message: 'Material uploaded successfully',
      courseId: id,
      filename: file.filename,
      path: file.path,
    };
  }
}
