import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-policies-list',
  templateUrl: './policies-list.component.html',
  styleUrls: ['./policies-list.component.css'],
})
export class PoliciesListComponent implements OnInit {
  policyList: any[] = [];
  showLoader: boolean = false;
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;

  constructor(
    private notificationService: NotificationService,
    private policyService: PolicyService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getPolicyList();
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
      pageLimit: this.pagesize
    };

    this.policyList = [];
    this.policyService.getPolicyList(params).subscribe(
      (response) => {
        this.spinner.hide();
        this.policyList = response?.data?.policyList || [];
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
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
