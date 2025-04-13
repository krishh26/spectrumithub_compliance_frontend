import { environment } from './../../../../environment/environment';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
@Component({
  selector: 'app-employee-details-outstanding',
  templateUrl: './employee-details-outstanding.component.html',
  styleUrls: ['./employee-details-outstanding.component.css'],
})
export class EmployeeDetailsOutstandingComponent {
  employeeId: any = null;
  employeeData: any;
  showLoader: boolean = false;
  showAllDetails = false;
  outstandingtestlist: any[] = [];
  selectedDate: string = '';
  baseImageURL = environment.baseUrl;
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.employeeId = params.get('id');
    });
    this.getOneEmployee();
    this.searchText.valueChanges.subscribe(() => {
      this.getOutstandingTestLists();
    })
  }

  openDatePicker(input: HTMLInputElement) {
    input.showPicker(); // Opens native date picker
  }

  onDateChange(date: string, subPolicyId: string) {
    const payload = {
      subPolicyId: subPolicyId,
      employeeId: this.employeeId,
      dueDate: date
    }
    this.spinner.show();
    this.employeeService.dueDateSetting(payload).subscribe(
      (response) => {
        this.spinner.hide();
        this.getOutstandingTestLists();
        window.location.reload();
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      }
    );
  }

  getOneEmployee() {
    this.spinner.show();
    this.employeeService.getOneEmployee(this.employeeId).subscribe(
      (response) => {
        this.spinner.hide();
        this.employeeData = response?.data;
        this.getOutstandingTestLists();
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      }
    );
  }

  gotoCompletedPage() {
    this.router.navigateByUrl(`/admin/employee-details-completed/${this.employeeId}`);
  }

  toggleDetails() {
    this.showAllDetails = !this.showAllDetails;
  }

  getOutstandingTestLists() {
    let param = {
      employeeId: this.employeeId,
      pageNumber: 1,
      isFrontEndRequest: 1,
      pageLimit: this.pagesize,
      searchText: this.searchText.value,
      userGroup: this.employeeData?.role == 'EMPLOYEE' ? "1" : "2"
    }
    this.spinner.show();
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
            data['subPoliciyDetail'] = tempData;
          });
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
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      }
    );
  }

  async getResultSubPolicyWise(subPolicyId: string): Promise<number> {
    const payload = {
      employeeId: this.employeeId,
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

  paginate(page: number) {
    this.page = page;
    this.getOutstandingTestLists();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
