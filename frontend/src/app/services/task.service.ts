import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskResponse, DeleteTaskResponse } from '../models/task.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/tasks`;

  // Signal for tasks list
  tasks = signal<Task[]>([]);

  // Signal for loading state
  isLoading = signal(false);

  createTask(data: CreateTaskRequest) {
    this.isLoading.set(true);
    return this.http.post<TaskResponse>(`${this.apiUrl}/createTask`, data).pipe(
      tap(() => this.isLoading.set(false))
    );
  }

  getTasks() {
    this.isLoading.set(true);
    return this.http.get<TaskResponse>(`${this.apiUrl}/myTasks`).pipe(
      tap(() => this.isLoading.set(false))
    );
  }

  getTaskById(id: string) {
    return this.http.get<TaskResponse>(`${this.apiUrl}/tasks/${id}`);
  }

  updateTask(id: string, data: UpdateTaskRequest) {
    return this.http.put<TaskResponse>(`${this.apiUrl}/tasks/${id}`, data);
  }

  deleteTask(id: string) {
    return this.http.delete<DeleteTaskResponse>(`${this.apiUrl}/tasks/${id}`);
  }
}
