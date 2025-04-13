import { AfterViewInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-outstanding',
  templateUrl: './outstanding.component.html',
  styleUrls: ['./outstanding.component.css']
})
export class OutstandingComponent implements AfterViewInit {
  outstandingtestlist: any[] = [];
  showLoader: boolean = false;
  loginUser: any = [];
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();
  showData: boolean = true;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private employeeService: EmployeeService,
    private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
  ) {
    this.loginUser = this.localStorageService.getLogger();
  }

  ngAfterViewInit() {
    // Initialize all tooltips globally in this component
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  showTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltipInstance = bootstrap.Tooltip.getInstance(target) || new bootstrap.Tooltip(target);

    // Show tooltip on click
    tooltipInstance.show();
  }

  ngOnInit() {
    this.getOutstandingTestLists();
    this.searchText.valueChanges.subscribe(() => {
      this.getOutstandingTestLists();
    })
  }

  paginate(page: number) {
    this.page = page;
    this.getOutstandingTestLists();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getOutstandingTestLists() {
    let param = {
      employeeId: this.loginUser._id,
      pageNumber: 1,
      pageLimit: this.pagesize,
      searchText: this.searchText.value,
      isFrontEndRequest: 1,
      userGroup: this.loginUser?.role == 'EMPLOYEE' ? "1" : "2"
    }
    this.spinner.show();
    this.showData = false;
    this.outstandingtestlist = [];
    this.employeeService.getOutstandingTestList(param).subscribe(
      (response) => {
        const forInfoList = response?.data?.policyList?.filter((element: any) => element?.policyType == 'For Information')
        // this.outstandingtestlist = response?.data?.policyList;


        response?.data?.policyList?.map((element: any) => {
          if (Number(element?.subPoliciyDetail?.[0]?.policySettingDetail?.maximumAttempt) > element?.subPoliciyDetail?.[0]?.resultDetails?.length) {
            if (element?.policyType == 'For Action') {
              const data = element?.subPoliciyDetail?.find((el: any) => el?._id == element?.subPoliciyList?._id);
              if (data?.resultDetails?.length !== 0 || data?.resultDetails) {
                this.outstandingtestlist.push(element);
              }
            }
          }
        });

        this.outstandingtestlist?.map((element) => {
          if (element?.policyType == 'For Action') {
            const filterSubPolicyData: any[] = element?.subPoliciyDetail?.find((data: any) => data?._id == element?.subPoliciyList?._id && data?.resultDetails?.length == 0);

            element['subPoliciyDetail'] = element?.subPoliciyDetail?.filter((data: any) => data?.resultDetails?.length !== 0) || [];

            if (filterSubPolicyData) {
              element['subPoliciyDetail']?.push(filterSubPolicyData);
            }
          }
        })


        for (const data of this.outstandingtestlist || []) {
          const tempData: any[] = [];
          data?.subPoliciyDetail?.map((element: any) => {
            if (tempData?.length == 0 && element?.questions?.length >= element?.policySettingDetail?.maximumQuestions) {
              tempData?.push(element);
            } else {
              const existingData = tempData?.find((details) => details?._id == element?._id);
              if (!existingData && element?.questions?.length >= element?.policySettingDetail?.maximumQuestions) {
                tempData?.push(element);
              }
            }
          });
          data['subPoliciyDetail'] = tempData;
        }

        this.outstandingtestlist = this.splitPolicies(this.outstandingtestlist);

        for (const data of this.outstandingtestlist || []) {
          setTimeout(async () => {
            try {
              const resultDetails = await this.getResultSubPolicyWise(data?.subPoliciyDetail?.[0]?._id);
              data.subPoliciyDetail[0]['resultCount'] = resultDetails;
            } catch (error) {
            }
          }, 500);
        }

        setTimeout(() => {
          this.outstandingtestlist = this.outstandingtestlist?.filter((element) => element?.subPoliciyDetail[0]?.resultCount < element?.subPoliciyDetail[0]?.policySettingDetail?.maximumAttempt);
          this.spinner.hide();
          this.showData = true;
          forInfoList?.map((element: any) => {
            if (element?.policyType == 'For Information') {
              const data = element?.subPoliciyDetail?.find((el: any) => el?._id == element?.subPoliciyList?._id);
              if ((data?.conditionDetail?.length == 0 || !data?.conditionDetail)) {
                this.outstandingtestlist.push(element);
              }
            }
          });
        }, 2000);

        this.totalRecords = response?.data?.count || 0;
      },
      (error) => {
        this.spinner.hide();
        this.showData = true;
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      }
    );
  }

  async getResultSubPolicyWise(subPolicyId: string): Promise<number> {
    const payload = {
      employeeId: this.loginUser?._id,
      subPolicyId: subPolicyId
    };

    return new Promise((resolve, reject) => {
      this.employeeService.getResultBasedOnSubPolicy(payload).subscribe(
        (response) => {
          const count = response?.data?.resultList?.length || 0;
          resolve(count); // Return the count properly
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  splitPolicies(policies: any[]): any[] {
    const result: any[] = [];

    policies.forEach(policy => {
      if (policy?.policyType == 'For Action') {
        if (policy.subPoliciyDetail.length > 1) {
          const data = policy?.subPoliciyDetail?.filter((el: any) => el?._id == policy?.subPoliciyList?._id);
          if (data?.length !== 0) {
            policy["subPoliciyDetail"] = data;
            policy.subPoliciyDetail.forEach((detail: any) => {
              result.push({
                ...policy,
                subPoliciyDetail: [detail],
              });
            });
          }
        } else {
          result.push(policy);
        }
      }
    });

    return result;
  }

  dayLeft(resultDetails: any[], reAttemptDays: any, maximumAttempt: any) {
    resultDetails.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latestResult = resultDetails[0];

    const dueDateObj = new Date(latestResult?.createdAt);
    dueDateObj.setDate(dueDateObj.getDate() + reAttemptDays);

    const today = new Date();
    const remainingDays = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return remainingDays > 0 ? `${remainingDays} days left` : "ReExam";
  }

  dueDateCheck(dueDate: any): boolean {
    const currentDate = new Date(); // Get the current date
    const inputDate = new Date(dueDate); // Convert the dueDate to a Date object
    // Set time to 00:00:00 for both dates to compare only the date part
    currentDate.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate < currentDate; // Return true if dueDate is greater than current date
  }
}
