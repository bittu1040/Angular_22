import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CreateTaskRequest, UpdateTaskRequest, Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  protected taskService = inject(TaskService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  formData: CreateTaskRequest & UpdateTaskRequest = {
    title: '',
    description: '',
    status: 'pending'
  };

  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);
  currentTaskId = signal<string | null>(null);

  ngOnInit() {
    const taskId = this.activatedRoute.snapshot.paramMap.get('id');
    if (taskId) {
      this.isEditMode.set(true);
      this.currentTaskId.set(taskId);
      this.loadTask(taskId);
    }
  }

  loadTask(taskId: string) {
    this.taskService.getTaskById(taskId).subscribe({
      next: (response) => {
        if (response.success && !Array.isArray(response.data)) {
          const task = response.data as Task;
          this.formData = {
            title: task.title,
            description: task.description,
            status: task.status
          };
        }
      },
      error: (error) => {
        this.errorMessage.set('Failed to load task');
      }
    });
  }

  onSubmit() {
    if (!this.formData.title?.trim()) {
      this.errorMessage.set('Title is required');
      return;
    }

    this.errorMessage.set(null);

    if (this.isEditMode() && this.currentTaskId()) {
      this.taskService.updateTask(this.currentTaskId()!, this.formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/tasks']);
          }
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Failed to update task');
        }
      });
    } else {
      this.taskService.createTask(this.formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/tasks']);
          }
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Failed to create task');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
