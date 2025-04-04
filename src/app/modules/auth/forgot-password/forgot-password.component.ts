import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthServiceService } from 'src/app/services/auth/auth-service.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  showLoader: boolean = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authServiceService: AuthServiceService,
    private router: Router,
     private notificationService: NotificationService,
     private spinner: NgxSpinnerService,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  ngOnInit(): void {}

  // Getter for easy access to form controls in the template
  get f() {
    return this.forgotForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.forgotForm.invalid) {
      return;
    }
    if (this.forgotForm.valid) {
       this.spinner.show();
      this.authServiceService.forgotUser(this.forgotForm.value).subscribe(
        (response) => {
          this.spinner.hide();
          this.router.navigate(['/login']);
          this.notificationService.showSuccess(response?.message || 'User login successfully');
        },
        (error) => {
          this.spinner.hide();
          this.notificationService.showError(error?.error?.message || 'Something went wrong!');
        }
      );
    }
  }
}
