import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../admin/home/home.component';
import { OutstandingComponent } from './outstanding/outstanding.component';
import { SharedModule } from 'src/app/utility/shared/shared.module';
import { CompletedTestComponent } from './completed-test/completed-test.component';
import { ExamIntructionComponent } from './exam-intruction/exam-intruction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExamComponent } from './exam/exam.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { ShowExamQuestionsComponent } from './show-exam-questions/show-exam-questions.component';

const routes: Routes = [
  { path: '', redirectTo: 'outstanding', pathMatch: 'full' },
  {
    path: 'start-exam/:id',
    component: ExamComponent,
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'outstanding',
        component: OutstandingComponent,
      },
      {
        path: 'completed',
        component: CompletedTestComponent,
      },
      {
        path: 'instruction/:id',
        component: ExamIntructionComponent,
      },
      // {
      //   path: 'start-exam/:id',
      //   component: ExamComponent,
      // },
      {
        path: 'show-exam-questions/:id',
        component: ShowExamQuestionsComponent,
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
    OutstandingComponent,
    CompletedTestComponent,
    ExamIntructionComponent,
    ExamComponent,
    ShowExamQuestionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPaginationModule
  ]
})
export class ComplianceTestModule { }
