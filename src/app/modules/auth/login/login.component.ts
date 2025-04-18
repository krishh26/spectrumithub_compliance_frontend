import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthServiceService } from 'src/app/services/auth/auth-service.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { environment } from 'src/environment/environment';

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
  isShowOTP: boolean = false;

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
      otp: ['', [Validators.required]]
      // password: ['', [Validators.required]], //Validators.minLength(6)
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

  // loginWithMicrosoft() {
  //   this.submitted = true;
  //   // if (this.loginForm.invalid) {
  //   //   return;
  //   // }
  //   console.log("this is form value", this.loginForm.value?.email);
  //   this.spinner.show();
  //   this.authServiceService.checkRegisterUser({ email: this.loginForm.value?.email }).subscribe((response) => {
  //     if ((response?.statusCode == 200 || response?.statusCode == 201) && response?.data?.isRegisterUser) {
  //       window.open(`${environment.baseUrl}/auth/microsoft`, '_blank');
  //     } else {
  //       this.notificationService.showError(response?.message || "User not found in system!");
  //     }
  //     this.spinner.hide();
  //   }, (error) => {
  //     this.notificationService.showError(error?.error?.message || "User not found in system!");
  //     this.spinner.hide();
  //   })
  // }

  submit() {
    if (this.isShowOTP) {
      this.loginUser();
    } else {
      this.checkTheRegisterUser();
    }
  }

  checkTheRegisterUser() {
    this.submitted = true;
    if (!this.loginForm.value?.email) {
      return;
    }
    this.spinner.show();
    this.authServiceService.checkRegisterUser({ email: this.loginForm.value?.email }).subscribe((response) => {
      if ((response?.statusCode == 200 || response?.statusCode == 201) && response?.data?.isRegisterUser) {
        this.isShowOTP = true;
        this.submitted = false;
      } else {
        this.notificationService.showError(response?.message || "User not found in system!");
      }
      this.spinner.hide();
    }, (error) => {
      this.notificationService.showError(error?.error?.message || "User not found in system!");
      this.spinner.hide();
    })
  }

  loginUser() {
    this.submitted = true;
    if (!this.loginForm.value?.otp) {
      return;
    }
    this.spinner.show();
    this.authServiceService.verifyOTP({ email: this.loginForm.value?.email, otp: this.loginForm.value?.otp }).subscribe(
      (response) => {
        this.localStorageService.setLoginToken(response?.data?.access_token);
        this.localStorageService.setLogger(response.data);
        this.spinner.hide();
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
