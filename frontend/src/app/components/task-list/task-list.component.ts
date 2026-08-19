import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  protected taskService = inject(TaskService);
  private router = inject(Router);

  taskList = computed(() => this.taskService.tasks());

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.taskService.tasks.set(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load tasks:', error);
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/tasks/create']);
  }

  goToEdit(taskId: string) {
    this.router.navigate(['/tasks/edit', taskId]);
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Failed to delete task:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
