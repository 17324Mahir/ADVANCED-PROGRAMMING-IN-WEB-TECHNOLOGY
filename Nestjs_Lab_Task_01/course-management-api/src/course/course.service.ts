import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseService {
  getAllCourses(): string {
    return 'Get All Courses - from Service';
  }

  getCourseById(id: string): string {
    return `Get Course with ID: ${id} - from Service`;
  }

  createCourse(): string {
    return 'Create Course - from Service';
  }

  updateCourse(id: string): string {
    return `Update Course ${id} - from Service`;
  }

  patchCourse(id: string): string {
    return `Patch Course ${id} - from Service`;
  }

  deleteCourse(id: string): string {
    return `Delete Course ${id} - from Service`;
  }
}
