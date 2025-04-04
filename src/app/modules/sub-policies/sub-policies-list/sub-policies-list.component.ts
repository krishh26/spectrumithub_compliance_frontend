import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sub-policies-list',
  templateUrl: './sub-policies-list.component.html',
  styleUrls: ['./sub-policies-list.component.css'],
})
export class SubPoliciesListComponent {
  policyList: any[] = [];
  showLoader: boolean = false;
  policyId: any = null;
  latestPolicy: any;
  countDetails: any;
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  selectedVersion: any;
  policyDetails: any;
  version: any;

  constructor(
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private policyService: PolicyService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.policyId = params.get('id');
      this.getPolicyDetails();
      this.getPolicyList();
    });
    this.version = this.route?.snapshot?.queryParamMap?.get('version') || null;
  }

  getPolicyDetails() {
    this.spinner.show();
    this.policyService.getPolicyDetails(this.policyId).subscribe((response) => {
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        this.policyDetails = response?.data;
      }
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    })
  }

  paginate(page: number) {
    this.page = page;
    this.getPolicyList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPolicyList() {
    this.spinner.show();
    this.policyList = [];

    this.subPoliciesService.getSubPolicyList({ policyId: this.policyId }).subscribe(
      (response) => {
        this.spinner.hide();

        this.policyList = response?.data?.subPolicyList || [];

        if (this.policyList.length && !this.version) {
          const sortedPolicies = [...this.policyList].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.latestPolicy = sortedPolicies[0];
          this.selectedVersion = this.latestPolicy?.version
          if (this.latestPolicy) {
            if(this.policyDetails?.policyType == 'For Information') {
              this.getSubPolicyCountAndDataForInfo();
            } else {
              this.getSubPolicyCountAndData();
            }
          }
        }

        if (this.version) {
          const findPolicy = this.policyList?.find((element) => element.version == this.version);
          this.latestPolicy = findPolicy || {};
          this.selectedVersion = this.latestPolicy?.version
          if (this.latestPolicy) {
            if(this.policyDetails?.policyType == 'For Information') {
              this.getSubPolicyCountAndDataForInfo();
            } else {
              this.getSubPolicyCountAndData();
            }
          }
        }

        this.totalRecords = response?.data?.count || 0;
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      }
    );
  }

  onVersionChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const findPolicy = this.policyList?.find((element) => element.version == selectedValue);
    this.latestPolicy = findPolicy || {};
    this.selectedVersion = this.latestPolicy?.version
    if (this.latestPolicy) {
      if(this.policyDetails?.policyType == 'For Information') {
        this.getSubPolicyCountAndDataForInfo();
      } else {
        this.getSubPolicyCountAndData();
      }
    }
  }

  uploadSubPolicies(id: string) {
    localStorage.setItem('subPolicyId', id);
    this.router.navigate(['/sub-policies/upload-sub-policy', this.policyId]);
  }

  deleteSubPolicy(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete sub policy ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4285F4',
      cancelButtonColor: '#C8C8C8',
      confirmButtonText: 'Yes, Delete!',
    }).then((result: any) => {
      if (result?.value) {
        this.spinner.show();
        const payload = { id: id };
        this.subPoliciesService.deleteSubPolicy(payload).subscribe(
          (response) => {
           this.spinner.hide();
            this.notificationService.showSuccess('Delete Sub Policy successfully');
            this.getPolicyList();
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

  getSubPolicyCountAndData() {
    this.spinner.show();
    this.subPoliciesService.getSubPolicyCountAndData({ subPolicyId: this.latestPolicy?._id }).subscribe((response) => {
      this.spinner.hide();
      this.countDetails = response?.data;
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    });
  }

  getSubPolicyCountAndDataForInfo() {
    this.spinner.show();
    this.subPoliciesService.getSubPolicyCountAndDataForInformation({ subPolicyId: this.latestPolicy?._id }).subscribe((response) => {
      this.spinner.hide();
      this.countDetails = response?.data;
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    });
  }
}
