import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import Swal from 'sweetalert2';
import { BulkEntryEmployeeComponent } from '../bulk-entry-employee/bulk-entry-employee.component';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  showLoader: boolean = false;
  page: number = pagination.page;
  pagesize = 1000;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();
  filterEmployee = false;
  selectedFilter: string = 'BOTH';
  filterLineManager = false;
  sortBy: string = '_id';
  sortOrder: string = 'desc';

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private employeeService: EmployeeService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getEmployees();
    this.searchText.valueChanges.subscribe(() => {
      this.getEmployees();
    });
  }

  paginate(page: number) {
    this.page = page;
    this.getEmployees();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sortTable(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sorting order
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc'; // Default to ascending when a new column is clicked
    }
    this.getEmployees();
  }

  getEmployees() {


    const params = {
      pageNumber: this.page,
      pageLimit: this.pagesize,
      searchText: this.searchText.value,
      sortOrder: this.sortOrder,
      sortBy: this.sortBy,
    };
    this.spinner.show();
    this.employeeService.getEmployee(params).subscribe(
      (response) => {
        this.spinner.hide();

        this.employees = response?.data?.employeeList;
        this.filteredEmployees = response?.data?.employeeList;
        this.checkBoxChange()

        // Ensure totalRecords is updated
        this.totalRecords = response?.data?.count || 0;
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
  }

  openAddTeamModal() {
    this.modalService.open(BulkEntryEmployeeComponent, { size: 'l' });
  }

  deleteEmployee(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00B96F',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!',
    }).then((result: any) => {
      if (result?.value) {
        this.showLoader = true;
        this.employeeService.deleteEmployee(id).subscribe(
          (response) => {
            this.spinner.show();
            this.notificationService.showSuccess(
              response?.message || 'Delete Employee successfully'
            );
            this.getEmployees();
          },
          (error) => {
            this.spinner.hide();
            this.notificationService.showError(
              error?.error?.message || 'Something went wrong!'
            );
          }
        );
      }
    });
  }

  onToggleSwitch(employee: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Inactive this employee?',
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Enter Resoan',
      inputValidator: (value) => {
        if (!value) {
          return 'Resoan is required!';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: '#00B96F',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Inactive!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const payload = {
          id: employee._id,
          reason: result.value,
        };
        this.employeeService.inActiveEmployee(payload).subscribe(
          (response) => {
            this.spinner.hide();
            this.notificationService.showSuccess(
              response?.message || 'Employee Inactive successfully'
            );
            this.getEmployees();
          },
          (error) => {
            this.spinner.hide();
            this.notificationService.showError(
              error?.error?.message || 'Something went wrong!'
            );
          }
        );
      } else {
        this.getEmployees();
      }
    });
  }
  checkBoxChange() {
    this.filteredEmployees = this.employees; // Reset to original list

    if (this.filterEmployee && !this.filterLineManager) {
      // Show only Employees
      this.filteredEmployees = this.employees.filter(
        (emp) => emp.role === 'EMPLOYEE'
      );
    } else if (!this.filterEmployee && this.filterLineManager) {
      // Show only Line Managers
      this.filteredEmployees = this.employees.filter(
        (emp) => emp.role === 'LINEMANAGER'
      );
    } else if (this.filterEmployee && this.filterLineManager) {
      // Show both Employee & Line Manager
      this.filteredEmployees = this.employees.filter(
        (emp) => emp.role === 'EMPLOYEE' || emp.role === 'LINEMANAGER'
      );
    }
  }

  filterEmployees() {
    if (this.selectedFilter === 'EMPLOYEE') {
      this.filteredEmployees = this.employees.filter(emp => emp.role === 'EMPLOYEE');
    } else if (this.selectedFilter === 'LINEMANAGER') {
      this.filteredEmployees = this.employees.filter(emp => emp.role === 'LINEMANAGER');
    } else {
      // Show both Employee & Line Manager
      this.filteredEmployees = this.employees;
    }
  }

  // Add a getter to check if there are any non-admin employees
  get hasNonAdminEmployees(): boolean {
    return this.filteredEmployees && this.filteredEmployees.some(emp => emp.role !== 'ADMIN');
  }
}
