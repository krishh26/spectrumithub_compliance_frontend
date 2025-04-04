import { ComplianceTestModule } from './modules/compliance-test/compliance-test.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { CreatePasswordComponent } from './modules/auth/create-password/create-password.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'reset', component: ResetPasswordComponent },
  { path: 'create-password', component: CreatePasswordComponent },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'policies',
    loadChildren: () =>
      import('./modules/policies/policies.module').then(
        (m) => m.PoliciesModule
      ),
  },
  {
    path: 'sub-policies',
    loadChildren: () =>
      import('./modules/sub-policies/sub-policies.module').then(
        (m) => m.SubPoliciesModule
      ),
  },
  {
    path: 'employee-policies',
    loadChildren: () =>
      import('./modules/employee-policies/employee-policies.module').then(
        (m) => m.EmployeePoliciesModule
      ),
  },
  {
    path: 'support',
    loadChildren: () =>
      import('./modules/support/support.module').then(
        (m) => m.SupportModule
      ),
  },
  {
    path: 'compliance-test',
    loadChildren: () =>
      import('./modules/compliance-test/compliance-test.module').then(
        (m) => m.ComplianceTestModule
      ),
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
