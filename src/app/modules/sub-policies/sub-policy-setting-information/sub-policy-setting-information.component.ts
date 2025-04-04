import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';

@Component({
  selector: 'app-sub-policy-setting-information',
  templateUrl: './sub-policy-setting-information.component.html',
  styleUrls: ['./sub-policy-setting-information.component.css']
})
export class SubPolicySettingInformationComponent {
   testSettingsForm: FormGroup;
    submitted: boolean = false;
    subPolicyId!: any;
    showLoader: boolean = false;
    subPolicyDetails: any;
    subPolicyList: any[] = [];
    latestPolicy: any = {};

    constructor(
      private fb: FormBuilder,
      private location: Location,
      private subPoliciesService: SubPoliciesService,
      private route: ActivatedRoute,
      private notificationService: NotificationService,
      private spinner: NgxSpinnerService,
      private router: Router
    ) {
      this.route.paramMap.subscribe((params) => {
        this.subPolicyId = String(params.get('id'));
        if (this.subPolicyId) {
          this.getSettingDetails();
          this.getSubPolicyDetails();
        }
      });

      this.testSettingsForm = this.fb.group({
        examTimeLimit: ['', [Validators.required]],
        maximumRettemptDaysLeft: ['', []],
        maximumAttempt: ['', []],
        maximumMarks: ['', []],
        maximumQuestions: ['', []],
        maximumScore: [{ value: '', disabled: true }],
        timeLimit: ['', []],
        PassingScore: ['', []],
        publishDate: ['', [Validators.required]],
        skipWeekDays: ["0", []],
      });

      this.testSettingsForm.get('maximumMarks')?.valueChanges.subscribe(() => this.calculateValues());
      this.testSettingsForm.get('maximumQuestions')?.valueChanges.subscribe(() => this.calculateValues());
    }

    get f() {
      return this.testSettingsForm.controls;
    }

    getSubPolicyDetails() {
      this.spinner.hide();
      this.subPoliciesService.getPolicyDetails(this.subPolicyId).subscribe((response) => {
        if (response?.statusCode == 200 || response?.statusCode == 201) {
          this.subPolicyDetails = response?.data?.length > 0 ? response?.data?.[0] : response?.data;
          this.getSubPolicyList();
        }
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      })
    }

    copyLatestSetting() {
      this.getSettingDetails(this.latestPolicy?._id);
    }

    getSubPolicyList() {
      this.spinner.show();
      this.subPolicyList = [];

      this.subPoliciesService.getSubPolicyList({
        policyId: this.subPolicyDetails?.policyId, pageLimit: 10000, pageNumber: 1
      }).subscribe(
        (response) => {
          this.spinner.hide();

          this.subPolicyList = response?.data?.subPolicyList || [];

          if (this.subPolicyList.length) {
            const sortedPolicies = [...this.subPolicyList].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const validPolicy = sortedPolicies.find(policy => policy.policySettings);;
            if (validPolicy) {
              this.latestPolicy = validPolicy;
            }
          }
        },
        (error) => {
          this.spinner.hide();
          this.notificationService.showError(error?.error?.message || 'Something went wrong!');
        }
      );
    }

    getSettingDetails(id?: string) {
      const payload = {
        subPolicyId: this.subPolicyId
      }

      if (id) {
        payload['subPolicyId'] = id
      }

      this.subPoliciesService.getPolicySetting(payload).subscribe((response) => {
        if (response?.data) {
          const formattedExamTimeLimit = response?.data?.examTimeLimit
            ? new Date(response?.data?.examTimeLimit).toISOString().split('T')[0]
            : '';
          const formattedPublish = response?.data?.publishDate
            ? new Date(response?.data?.publishDate)
              .toISOString()
              .split('T')[0]
            : '';

          this.testSettingsForm.patchValue({
            examTimeLimit: id ? "" : formattedExamTimeLimit,
            maximumRettemptDaysLeft: response?.data?.maximumRettemptDaysLeft,
            maximumAttempt: response?.data?.maximumAttempt,
            maximumMarks: response?.data?.maximumMarks,
            maximumQuestions: response?.data?.maximumQuestions,
            maximumScore: response?.data?.maximumScore,
            timeLimit: response?.data?.timeLimit,
            PassingScore: response?.data?.PassingScore,
            publishDate: id ? "" : formattedPublish,
            skipWeekDays: response?.data?.skipWeekDays,
          });
        } else {
          this.testSettingsForm.reset();
          this.testSettingsForm.patchValue({
            skipWeekDays: 1,
          });
        }
      }, (error) => {
        this.testSettingsForm.reset();
        this.testSettingsForm.patchValue({
          skipWeekDays: 1,
        });
      })
    }

    calculateValues(): void {
      const maxMarks = Number(this.testSettingsForm.get('maximumMarks')?.value) || 0;
      const maxQuestions = Number(this.testSettingsForm.get('maximumQuestions')?.value) || 1; // Avoid division by zero

      // Calculate passing marks and max score
      const maxScore = (maxMarks / maxQuestions).toFixed(2);

      this.testSettingsForm.patchValue({
        maximumScore: maxScore,
      });
    }

    back() {
      this.location.back();
    }

    onSubmit() {
      this.submitted = true;

      if (!this.testSettingsForm.valid) {
        return;
      }

      if(this.testSettingsForm.get('skipWeekDays')?.value) {
        this.testSettingsForm.patchValue({
          skipWeekDays : "1"
        })
      } else {
        this.testSettingsForm.patchValue({
          skipWeekDays : "0"
        })
      }

      const payload = { ...this.testSettingsForm.getRawValue(), subPolicyId: this.subPolicyId, dueDate: this.testSettingsForm.get('examTimeLimit')?.value, policyType : "2" };

      this.subPoliciesService.updatePolicySetting(payload).subscribe((response) => {
        if (response?.statusCode == 200 || response?.statusCode == 201) {
          this.notificationService.showSuccess(response?.message || 'Setting Updated Successfully.');
          this.router.navigateByUrl(`/sub-policies/sub-policies-list/${this.subPolicyDetails?.policyId}`);
        } else {
          this.notificationService.showError(response?.message || 'Something went wrong!');
        }
      }, (error) => {
        this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      })
    }
}
