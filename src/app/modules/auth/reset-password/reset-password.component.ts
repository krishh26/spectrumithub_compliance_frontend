import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthServiceService } from 'src/app/services/auth/auth-service.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  forgotForm: FormGroup;
  showLoader: boolean = false;
  submitted = false;
  token!: any;
  showPassword = false;
  confirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authServiceService: AuthServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
     private spinner: NgxSpinnerService,
  ) {
    this.forgotForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  // Getter for easy access to form controls in the template
  get f() {
    return this.forgotForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.forgotForm.invalid) {
      return;
    }
    if (
      this.forgotForm.value.password != this.forgotForm.value.confirmPassword
    ) {
      this.notificationService.showError(
        'Password and Confirm Password do not match'
      );
      return;
    }
    if (this.forgotForm.valid) {
      this.spinner.show();
      this.authServiceService.resetUser({ password: this.forgotForm.value.password }, this.token).subscribe(
        (response) => {
          this.spinner.hide();
          this.router.navigate(['/login']);
          this.notificationService.showSuccess(response?.message || 'Password changed successfully');
        },
        (error) => {
          this.spinner.hide();
          this.notificationService.showError(error?.error?.message || 'Something went wrong!');
        }
      );
    }
  }
}
