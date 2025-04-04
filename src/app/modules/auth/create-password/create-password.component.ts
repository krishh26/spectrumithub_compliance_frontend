import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthServiceService } from 'src/app/services/auth/auth-service.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.css']
})
export class CreatePasswordComponent {
  createForm: FormGroup;
  showLoader: boolean = false;
  submitted = false;
  token!: any;
  loginUser: any;
  showPassword = false;
  confirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authServiceService: AuthServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private localStorageService: LocalStorageService,
     private spinner: NgxSpinnerService,
  ) {
    this.token = this.route?.snapshot?.queryParamMap?.get('token');
    this.createForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      confirmPassword: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {

  }

  // Getter for easy access to form controls in the template
  get f() {
    return this.createForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.createForm.invalid) {
      return;
    }
    if (
      this.createForm.value.password != this.createForm.value.confirmPassword
    ) {
      this.notificationService.showError(
        'Password and Confirm Password do not match'
      );
      return;
    }
    if (this.createForm.valid) {
      this.showLoader = true;
      this.authServiceService.createPassowrd({ password: this.createForm.value.password }, this.token).subscribe(
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
