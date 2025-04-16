import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html',
  styleUrls: ['./login-callback.component.css']
})
export class LoginCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      const user: any = jwtDecode(token);
      localStorage.setItem('loginToken', token);
      this.getOneEmployee(user?.id)
    } else {
      this.notificationService.showError('Login failed.');
      this.router.navigate(['login']);
    }
  }

  getOneEmployee(id: string) {
    this.employeeService.getOneEmployee(id).subscribe(
      (response) => {
        localStorage.setItem('loginUser', JSON.stringify(response?.data));
        this.router.navigate(['employee-policies']);
      },
      (error) => {
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
  }
}
