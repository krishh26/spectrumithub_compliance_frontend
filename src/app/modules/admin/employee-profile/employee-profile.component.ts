import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent {
  loginUser: any;
  employeeData: any;
  baseUrl = environment.baseUrl;

  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService
  ) {
    this.loginUser = this.localStorageService.getLogger();
  }

  ngOnInit() {
    this.getOneEmployee();
  }

  getOneEmployee() {
    this.spinner.show();
    this.employeeService.getOneEmployee(this.loginUser?._id).subscribe((response) => {
      this.employeeData = response?.data;
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    }
    );
  }
}
