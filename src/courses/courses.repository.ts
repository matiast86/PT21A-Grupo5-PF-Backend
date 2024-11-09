import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "./entities/course.entity";
import { Repository } from "typeorm";

@Injectable()
export class CoursesRepository {
    constructor(
        @InjectRepository(Course) private readonly coursesRepository: Repository<Course>
    ){}

    async getAllCourses(): Promise<Course[]> {
        return await this.coursesRepository.find({
        })
    }

    async findByTitle(title:string): Promise<Course | null> {
        return await this.coursesRepository.findOneBy({title})
    }

    async createCourse(data): Promise<Course[]> {
        return await this.coursesRepository.save(
            this.coursesRepository.create(data)
        )
    }
}