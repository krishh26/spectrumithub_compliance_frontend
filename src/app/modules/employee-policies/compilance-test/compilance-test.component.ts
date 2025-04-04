import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compilance-test',
  templateUrl: './compilance-test.component.html',
  styleUrls: ['./compilance-test.component.css'],
})
export class CompilanceTestComponent {
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
        this.policyList = response?.data || [];

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
