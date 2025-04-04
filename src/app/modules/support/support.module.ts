import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from './support/support.component';
import { HomeComponent } from '../admin/home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/utility/shared/shared.module';

const routes: Routes = [
  { path: '', redirectTo: 'support', pathMatch: 'full' },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'support',
        component: SupportComponent,
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

@NgModule({
  declarations: [
    SupportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SupportModule { }
