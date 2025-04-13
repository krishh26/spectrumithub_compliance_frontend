import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';

@Component({
  selector: 'app-sub-policy-completed',
  templateUrl: './sub-policy-completed.component.html',
  styleUrls: ['./sub-policy-completed.component.css']
})
export class SubPolicyCompletedComponent {
  subPolicyId: any = null;
  countDetails: any;
  dataList: any[] = [];
  dataType: string = 'EMPLOYEE';
  subPolicyDetails: any;
  settingDetails: any;
  policyDetails: any;

  constructor(
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private policyService: PolicyService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.subPolicyId = params.get('id');
      if (this.subPolicyId) {
        this.getSubPolicyDetails();
        this.getPolicySettingDetails();
        // this.getSubPolicyCountAndData();
      }
    });
  }


  convertDecimalMinutesToMinSec(decimalMinutes: number): string {
    const totalSeconds = Math.round(decimalMinutes * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const minPart = minutes > 0 ? `${minutes} Min` : '';
    const secPart = seconds > 0 ? `${seconds} Sec` : '';

    return `${minPart} ${secPart}`.trim();
  }

  getPolicySettingDetails() {
    this.subPoliciesService.getPolicySetting({ subPolicyId: this.subPolicyId }).subscribe((response) => {
      if (response?.statusCode == 200) {
        this.settingDetails = response?.data || {};
      } else {
        this.notificationService.showError(response?.message || 'Policy instructions not found.');
      }
    }, (error) => {
      this.notificationService.showError(error?.error?.message || 'Policy instructions not found.');
    })
  }

  getSubPolicyDetails() {
    this.spinner.show();
    this.subPoliciesService.getSubPolicyDetails({ id: this.subPolicyId }).subscribe((response) => {
      this.spinner.hide();
      this.subPolicyDetails = response?.data?.length > 0 ? response?.data?.[0] : response?.data;
      this.getPolicyDetails(this.subPolicyDetails?.policyId)
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    });
  }

  getSubPolicyCountAndData() {
    this.spinner.show();
    this.subPoliciesService.getSubPolicyCountAndData({ subPolicyId: this.subPolicyId }).subscribe((response) => {
      this.spinner.hide();
      this.countDetails = response?.data;
      this.dataList = this.countDetails?.empCompletedList || [];
      this.dataList = this.dataList?.map((policy) => {
        let sortedResults = policy?.resultDetails?.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Extract the latest result
        const latestResult = sortedResults.length ? sortedResults[0] : null;

        return {
          ...policy,
          latestResult,  // Set the latest result in the root object
          resultDetails: sortedResults  // Keep sorted result details
        };
      });
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    });
  }

  getSubPolicyCountAndDataForInfo() {
    this.spinner.show();
    this.subPoliciesService.getSubPolicyCountAndDataForInformation({ subPolicyId: this.subPolicyId }).subscribe((response) => {
      this.spinner.hide();
      this.countDetails = response?.data;
      this.dataList = this.countDetails?.empCompletedList || [];
      this.dataList = this.dataList?.map((policy) => {
        let sortedResults = policy?.resultDetails?.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Extract the latest result
        const latestResult = sortedResults.length ? sortedResults[0] : null;

        return {
          ...policy,
          latestResult,  // Set the latest result in the root object
          resultDetails: sortedResults  // Keep sorted result details
        };
      });
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    });
  }

  getPolicyDetails(id: string) {
    this.spinner.show();
    this.policyService.getPolicyDetails(id).subscribe((response) => {
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        this.policyDetails = response?.data;
        if (response?.data?.policyType == 'For Information') {
          this.getSubPolicyCountAndDataForInfo();
        } else {
          this.getSubPolicyCountAndData();
        }
      }
      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    })
  }

  changeType(type: string) {
    this.dataType = type;
    if (type == 'LINE_MANAGER') {
      this.dataList = this.countDetails?.lineManagerCompletedlist || [];
    } else {
      this.dataList = this.countDetails?.empCompletedList || [];
    }

    this.dataList = this.dataList?.map((policy) => {
      let sortedResults = policy?.resultDetails?.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Extract the latest result
      const latestResult = sortedResults?.length ? sortedResults[0] : null;

      return {
        ...policy,
        latestResult,  // Set the latest result in the root object
        resultDetails: sortedResults  // Keep sorted result details
      };
    });

  }
}
