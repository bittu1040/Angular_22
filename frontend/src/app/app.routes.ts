import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'tasks/create',
    component: TaskFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'tasks/edit/:id',
    component: TaskFormComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];
