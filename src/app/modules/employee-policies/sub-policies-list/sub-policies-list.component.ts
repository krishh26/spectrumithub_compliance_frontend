import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
@Component({
  selector: 'app-sub-policies-list',
  templateUrl: './sub-policies-list.component.html',
  styleUrls: ['./sub-policies-list.component.css'],
})
export class SubPoliciesListComponent {
  policyList: any[] = [];
  showLoader: boolean = false;
  policyId: any = null;
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  policyDetails: any;
  loginUser: any;

  constructor(
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private policyService: PolicyService,
    private localStorageService: LocalStorageService
  ) {
    this.loginUser = this.localStorageService.getLogger();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.policyId = params.get('id');
      if (this.policyId) {
        this.getPolicyDetails();
        // this.getSubPolicyList();
      }
    });
  }

  paginate(page: number) {
    this.page = page;
    this.getSubPolicyList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getPolicyDetails() {
    this.spinner.show();
    this.policyService.getPolicyDetails(this.policyId).subscribe((response) => {
      this.spinner.hide();
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        this.policyDetails = response?.data;
        this.getSubPolicyList();
      }
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    })
  }

  getSubPolicyList() {
    this.spinner.show();
    this.policyList = [];
    this.subPoliciesService
      .getSubPolicyList({
        policyId: this.policyId,
        isActive: 1,
        isFrontEndRequest: 1,
        employeeId: this.loginUser?._id,
        userGroup: this.loginUser.role == "LINEMANAGER" ? "2" : "1",
        payloadType: this.policyDetails?.policyType == 'For Information' ? '1' : '2'
      })
      .subscribe(
        (response) => {
          this.spinner.hide();
          response?.data?.subPolicyList?.map((element: any) => {
            if (element?.policySettings || element?.policySettings?.[0]) {
              this.policyList.push(element);
            }
          });

          this.policyList = this.policyList.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // this.policyList = response?.data?.subPolicyList || [];
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

  dueDateCheck(dueDate: any): boolean {
    const currentDate = new Date(); // Get the current date
    const inputDate = new Date(dueDate); // Convert the dueDate to a Date object

    return inputDate < currentDate; // Return true if dueDate is greater than current date
  }

  uploadSubPolicies() {
    this.router.navigate(['/sub-policies/upload-sub-policy', this.policyId]);
  }

  deleteSubPolicy(id: any) {
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
        this.spinner.show();
        const payload = { id: id };
        this.subPoliciesService.deleteSubPolicy(payload).subscribe(
          (response) => {
            this.spinner.hide();
            this.notificationService.showSuccess(
              'Delete Sub Policy successfully'
            );
            this.getSubPolicyList();
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
}
