import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotAuthenticatedLayoutComponent } from './components/not-authenticated-layout/not-authenticated-layout.component';
import { RouterModule } from '@angular/router';
import { AuthenticatedLayoutComponent } from './components/authenticated-layout/authenticated-layout.component';

@NgModule({
  declarations: [
    NotAuthenticatedLayoutComponent,
    AuthenticatedLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class CoreModule { }
