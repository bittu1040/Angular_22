import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
 import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CreateTaskRequest, UpdateTaskRequest, Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  protected taskService = inject(TaskService);
  private formBuilder = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  taskForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: [''],
    status: this.formBuilder.control<'pending' | 'completed'>('pending'),
  });

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
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
          });
        }
      },
      error: (error) => {
        this.errorMessage.set('Failed to load task');
      }
    });
  }

  onSubmit() {
    this.taskForm.markAllAsTouched();

    if (this.taskForm.invalid) {
      this.errorMessage.set('Title is required');
      return;
    }

    this.errorMessage.set(null);
    const formData = this.taskForm.getRawValue();

    if (this.isEditMode() && this.currentTaskId()) {
      const updateData: UpdateTaskRequest = formData;
      this.taskService.updateTask(this.currentTaskId()!, updateData).subscribe({
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
      const createData: CreateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };
      this.taskService.createTask(createData).subscribe({
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
