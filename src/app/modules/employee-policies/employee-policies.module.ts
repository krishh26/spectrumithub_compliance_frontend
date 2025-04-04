import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubPoliciesListComponent } from './sub-policies-list/sub-policies-list.component';
import { SharedModule } from '../../utility/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../admin/home/home.component';
import { PoliciesListComponent } from './policies-list/policies-list.component';
import { CompilanceTestComponent } from './compilance-test/compilance-test.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { TermsConditionEmployeeComponent } from './terms-condition-employee/terms-condition-employee.component';

const routes: Routes = [
  { path: '', redirectTo: 'employee-policies-list', pathMatch: 'full' },
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'employee-policies-list', component: PoliciesListComponent },
      { path: 'employee-sub-policies-list/:id', component: SubPoliciesListComponent, },
      { path: 'compilance-test', component: CompilanceTestComponent },
      { path: 'terms-condition-employee/:id', component: TermsConditionEmployeeComponent },
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
    PoliciesListComponent,
    SubPoliciesListComponent,
    CompilanceTestComponent,
    TermsConditionEmployeeComponent,
  ],
  imports: [CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    NgxPaginationModule
  ],
})
export class EmployeePoliciesModule { }
