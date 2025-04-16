import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthServiceService } from 'src/app/services/auth/auth-service.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  showLoader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authServiceService: AuthServiceService,
    private router: Router,
    private notificationService: NotificationService,
    private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]], //Validators.minLength(6)
    });
  }

  // Getter for easy access to form controls in the template
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    if (this.loginForm.valid) {
      this.spinner.show();
      this.authServiceService.loginUser(this.loginForm.value).subscribe(
        (response) => {
          this.spinner.hide();
          this.localStorageService.setLoginToken(response?.data?.access_token);
          this.localStorageService.setLogger(response.data);
          if (response.data.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['employee-policies']);
          }
          this.notificationService.showSuccess(
            response?.message || 'User login successfully'
          );
        },
        (error) => {
          this.spinner.hide();
          this.notificationService.showError(
            error?.error?.message || 'Something went wrong!'
          );
        }
      );
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
