import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import { Editor, Toolbar } from 'ngx-editor';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';

@Component({
  selector: 'app-upload-sub-policies',
  templateUrl: './upload-sub-policies.component.html',
  styleUrls: ['./upload-sub-policies.component.css'],
})
export class UploadSubPoliciesComponent implements OnInit, OnDestroy {
  policyForm: FormGroup;
  policyID!: any;
  showLoader: boolean = false;
  policyData: any;
  submitted: boolean = false;
  policyList: any[] = [];
  subPolicyId: any;
  editor!: Editor;
  html = '';
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private route: ActivatedRoute,
    private location: Location,
    private policyService: PolicyService,
    private spinner: NgxSpinnerService
  ) {
    this.editor = new Editor();
    this.policyForm = this.fb.group({
      policyId: ['', Validators.required],
      name: ['Test', Validators.required],
      version: ['', Validators.required],
      description: [''],
      isActive: [1],
    });
  }

  get f() {
    return this.policyForm.controls;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.policyID = params.get('id');
      this.policyForm.patchValue({
        policyId: this.policyID
      });
    });
    this.getPolicyList();
    const subpolicyId = localStorage.getItem('subPolicyId');
    if (subpolicyId) {
      this.subPolicyId = subpolicyId;
      this.getSubPolicyDetails();
    }
    this.searchText.valueChanges.subscribe(() => {
      this.getPolicyList();
    });
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
    localStorage.removeItem('subPolicyId');
  }

  back() {
    this.location.back();
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
        // this.notificationService.showSuccess(response?.message || 'Get Policy successfully');
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
  }

  getSubPolicyDetails() {
    this.spinner.show();
    this.subPoliciesService.getPolicyDetails(this.subPolicyId).subscribe((response) => {
      const subPolicyData = response?.data;
      if (subPolicyData) {
        this.policyForm.patchValue({
          policyId: subPolicyData.policyId,
          version: subPolicyData.version,
          description: subPolicyData.description,
          name: subPolicyData.name,
        });
      }
    }, (error) => {
     this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    }
    );
  }

  submitForm() {
    if(!this.policyForm?.get('policyId')?.value) {
      return this.notificationService.showError("Please select policy");
    }

    if(!this.policyForm?.get('version')?.value) {
      return this.notificationService.showError("Please enter the version of policy.");
    }

    if(!this.policyForm?.get('description')?.value) {
      return this.notificationService.showError("Please enter the description of policy.");
    }

    if (!this.policyForm.valid) {
      return;
    }

    if (this.subPolicyId) {
      return this.update();
    }
    this.spinner.show();
    this.subPoliciesService.createPolicy(this.policyForm.value).subscribe(
      (response) => {
        this.spinner.hide();
        this.notificationService.showSuccess(
          response?.message || 'Sub Policy Create successfully'
        );

        this.router.navigate([
          '/sub-policies/sub-policies-list',
          this.policyID,
        ]);
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
  }

  update() {
    this.spinner.show();
    this.subPoliciesService.updatePolicy(this.subPolicyId, this.policyForm.value).subscribe(
      (response) => {
        this.spinner.hide();
        this.notificationService.showSuccess(
          response?.message || 'Sub Policy updated successfully'
        );

        this.router.navigate([
          '/sub-policies/sub-policies-list',
          this.policyID,
        ]);
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
  }
}
