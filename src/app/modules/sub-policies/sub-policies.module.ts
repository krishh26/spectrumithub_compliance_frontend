import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubPoliciesListComponent } from './sub-policies-list/sub-policies-list.component';
import { SharedModule } from '../../utility/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../admin/home/home.component';
import { UploadSubPoliciesComponent } from './upload-sub-policies/upload-sub-policies.component';
import { SubPoliciesSettingComponent } from './sub-policies-setting/sub-policies-setting.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { EditQuestionComponent } from './edit-question/edit-question.component';
import { SubPolicyOutstandingComponent } from './sub-policy-outstanding/sub-policy-outstanding.component';
import { SubPolicyCompletedComponent } from './sub-policy-completed/sub-policy-completed.component';
import { BulyEntryQuestionComponent } from './buly-entry-question/buly-entry-question.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TermsConditionAdminComponent } from './terms-condition-admin/terms-condition-admin.component';
import { NgxEditorModule } from 'ngx-editor';
import { SubPolicySettingInformationComponent } from './sub-policy-setting-information/sub-policy-setting-information.component';
import { NgSelectModule } from '@ng-select/ng-select';
const routes: Routes = [
  { path: '', redirectTo: 'policies-list', pathMatch: 'full' },
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'sub-policies-list/:id', component: SubPoliciesListComponent },
      { path: 'upload-sub-policy/:id', component: UploadSubPoliciesComponent },
      {
        path: 'setting-sub-policies/:id',
        component: SubPoliciesSettingComponent,
      },
      {
        path: 'setting-sub-policies-for-information/:id',
        component: SubPolicySettingInformationComponent,
      },
      {
        path: 'question-list',
        component: QuestionListComponent,
      },
      {
        path: 'terms-condition-admin/:id',
        component: TermsConditionAdminComponent,
      },
      {
        path: 'create-question',
        component: CreateQuestionComponent,
      },
      {
        path: 'edit-question',
        component: EditQuestionComponent,
      },
      {
        path: 'outstanding/:id',
        component: SubPolicyOutstandingComponent,
      },
      {
        path: 'completed/:id',
        component: SubPolicyCompletedComponent,
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
    SubPoliciesListComponent,
    UploadSubPoliciesComponent,
    SubPoliciesSettingComponent,
    QuestionListComponent,
    CreateQuestionComponent,
    EditQuestionComponent,
    SubPolicyOutstandingComponent,
    SubPolicyCompletedComponent,
    BulyEntryQuestionComponent,
    TermsConditionAdminComponent,
    SubPolicySettingInformationComponent,
  ],
  imports: [CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    NgxPaginationModule,
    NgxEditorModule,
    NgSelectModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SubPoliciesModule { }
