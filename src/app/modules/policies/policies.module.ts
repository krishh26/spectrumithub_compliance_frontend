import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoliciesListComponent } from './policies-list/policies-list.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../admin/home/home.component';
import { UploadPoliciesComponent } from './upload-policies/upload-policies.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/utility/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';

const routes: Routes = [
  { path: '', redirectTo: 'policies-list', pathMatch: 'full' },
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'policies-list', component: PoliciesListComponent },
      { path: 'upload-policy', component: UploadPoliciesComponent },
      { path: 'upload-policy/:id', component: UploadPoliciesComponent },
      { path: 'terms-conditions', component: TermsConditionsComponent },
    ]
  },
  {
    path: "**",
    pathMatch: "full",
    redirectTo: ""
  }
];

@NgModule({
  declarations: [
    PoliciesListComponent,
    UploadPoliciesComponent,
    TermsConditionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule
  ]
})
export class PoliciesModule { }
