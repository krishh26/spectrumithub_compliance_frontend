import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-policies-list',
  templateUrl: './policies-list.component.html',
  styleUrls: ['./policies-list.component.css'],
})
export class PoliciesListComponent {
  policyList: any[] = [];
  showLoader: boolean = false;
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();

  constructor(
    private notificationService: NotificationService,
    private policyService: PolicyService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getPolicyList();
    this.searchText.valueChanges.subscribe(() => {
      this.getPolicyList();
    });
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

  paginate(page: number) {
    this.page = page;
    this.getPolicyList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  getPolicyList() {
    this.spinner.show();

    const params = {
      pageNumber: this.page,
      pageLimit: this.pagesize,
      searchText: this.searchText.value,
    }

    this.policyList = [];
    this.policyService.getPolicyList(params).subscribe(
      (response) => {
        this.spinner.hide();
        this.policyList = response?.data?.policyList || [];
        this.policyList = this.sortSubPoliciesByCreatedAt(this.policyList);
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

  sortSubPoliciesByCreatedAt(data: any[]): any[] {
    return data.map(policy => {
      return {
        ...policy,
        subPolicyDetail: policy.subPolicyDetail.map((subPolicies: any) =>
          subPolicies.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        )
      };
    });
  }

  deletePolicy(id: any) {
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
        this.policyService.deletePolicy(id).subscribe(
          (response) => {
            this.spinner.hide();
            this.notificationService.showSuccess('Delete Policy successfully');
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
}
