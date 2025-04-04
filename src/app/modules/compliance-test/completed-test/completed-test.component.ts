import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';

@Component({
  selector: 'app-completed-test',
  templateUrl: './completed-test.component.html',
  styleUrls: ['./completed-test.component.css']
})
export class CompletedTestComponent {
  completedtestlist: any[] = [];
  showLoader: boolean = false;
  loginUser: any = [];
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();
  sortby: FormControl = new FormControl();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private employeeService: EmployeeService,
    private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService
  ) {
    this.loginUser = this.localStorageService.getLogger();
  }

  ngOnInit() {
    this.getCompletedTestLists();
    this.searchText.valueChanges.subscribe(() => {
      this.getCompletedTestLists();
    })
  }

  searchData() {
    this.getCompletedTestLists();
  }

  paginate(page: number) {
    this.page = page;
    this.getCompletedTestLists();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getFormattedDuration(duration: number): string {
    return duration % 1 === 0 ? duration.toString() : duration.toFixed(2);
  }

  convertDecimalMinutesToMinSec(decimalMinutes: number): string {
    const totalSeconds = Math.round(decimalMinutes * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const minPart = minutes > 0 ? `${minutes} Min` : '';
    const secPart = seconds > 0 ? `${seconds} Sec` : '';

    return `${minPart} ${secPart}`.trim();
  }

  calculateDaysDifference(maximumAttempt: number, subPolicyId: string): any {
    // const passedDate = new Date(passedDateString);
    // const currentDate = new Date();

    // // Normalize time for comparison (set to 00:00:00)
    // passedDate.setHours(0, 0, 0, 0);
    // currentDate.setHours(0, 0, 0, 0);

    // if (currentDate > passedDate) {
    //   return '';
    // } else {
    //   const timeDiff = passedDate.getTime() - currentDate.getTime();
    //   const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    //   return daysDiff;
    // }
    const subList = this.completedtestlist?.filter((element : any) => element?._id == subPolicyId);
    const reCount = Number(subList?.length);
    return `${String(reCount)} of ${String(maximumAttempt)}`
  }


  getCompletedTestLists() {
    let param = {
      employeeId: this.loginUser._id,
      pageNumber: this.page,
      pageLimit: this.pagesize,
      searchText: this.searchText.value,
      sortBy: this.sortby.value || '_id',
      sortOrder: 'desc'
    }
    this.spinner.show();
    this.completedtestlist = [];
    this.employeeService.getCompletedTestList(param).subscribe(
      (response) => {
        this.spinner.hide();
        this.completedtestlist = response?.data?.subPolicyList;
        this.completedtestlist = this.splitPolicies(this.completedtestlist);
        this.completedtestlist = this.completedtestlist.map((policy) => {
          let sortedResults = policy.resultDetails.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Extract the latest result
          const latestResult = sortedResults.length ? sortedResults[0] : null;
          this.totalRecords = response?.data?.count || 0;
          return {
            ...policy,
            latestResult,  // Set the latest result in the root object
            resultDetails: sortedResults  // Keep sorted result details
          };
        });

      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      }
    );
  }

  splitPolicies(policies: any[]): any[] {
    const result: any[] = [];

    policies.forEach(policy => {
      if (policy.resultDetails.length > 1) {
        policy.resultDetails.forEach((detail: any) => {
          result.push({
            ...policy,
            resultDetails: [detail],
          });
        });
      } else {
        result.push(policy);
      }
    });

    return result;
  }
}
