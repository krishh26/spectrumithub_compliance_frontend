import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';

@Component({
  selector: 'app-edit-question',
  templateUrl: './edit-question.component.html',
  styleUrls: ['./edit-question.component.css'],
})
export class EditQuestionComponent {
  questionForm!: FormGroup;
  showLoader!: boolean;
  questionTypes = [
    {
      name: 'Single Choice',
      value: '3',
    },
    {
      name: 'Boolean',
      value: '2',
    },
    {
      name: 'Multiple Choice',
      value: '1',
    },
  ];
  questionData: any;
  questionId: string | null = null;
  userGroup: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private subPoliciesService: SubPoliciesService,
    private notificationService: NotificationService,
    private location: Location,
    private spinner: NgxSpinnerService,
  ) {
    this.questionForm = this.fb.group({
      questionType: ['', Validators.required],
      questionText: ['', Validators.required],
      options: this.fb.array([]),
      answer: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.questionId = params['questionId'];
      this.userGroup = params['userGroup'];
    });
    if (this.questionId && this.userGroup) {
      this.getQuestionDetails();
    }
  }

  getQuestionDetails() {
    this.spinner.show();
    this.subPoliciesService
      .getQuestionDetails({ id: this.questionId })
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (response?.data) {
            this.questionData = response?.data[0];
            this.initForm();
          }
        },
        (error) => {
          this.spinner.hide();

          this.notificationService.showError(
            error?.error?.message || 'Something went wrong!'
          );
        }
      );
  }

  initForm() {
    const selectedAnswers = this.questionData.answer
      .split(',')
      .map(
        (index: string) =>
          this.questionData?.optionsDetails[parseInt(index)]?.optionText
      );

    this.questionForm = this.fb.group({
      questionType: [this.questionData.questionType, Validators.required],
      questionText: [this.questionData.questionText, Validators.required],
      options: this.fb.array(
        this.questionData.optionsDetails.map(
          (option: any) =>
            new FormControl(option.optionText, Validators.required)
        )
      ),
      answer: [selectedAnswers, Validators.required], // Set selected options
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  setDefaultOptions() {
    const type = String(this.questionForm?.get('questionType')?.value);
    const optionsArray = this.options;
    optionsArray.clear();
    let defaultAnswer = ''; // Store default answer

    if (type === '3') {
      // MCQ: Always 4 fixed options
      const mcqOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      mcqOptions.forEach((option, index) => {
        optionsArray.push(new FormControl(option, Validators.required));
        if (index === 0) defaultAnswer = option;
      });
    } else if (type === '2') {
      // Boolean: Always True & False
      const booleanOptions = ['True', 'False'];
      booleanOptions.forEach((option, index) => {
        optionsArray.push(new FormControl(option, Validators.required));
        if (index === 0) defaultAnswer = option;
      });
    } else if (type === '1') {
      // Multiple Choice: Starts with 4 options
      const multipleOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      multipleOptions.forEach((option, index) => {
        optionsArray.push(new FormControl(option, Validators.required));
        if (index === 0) defaultAnswer = option;
      });
    }

    // Set the first option as the default answer
    this.questionForm.patchValue({ answer: defaultAnswer });
  }

  onTypeChange() {
    this.setDefaultOptions(); // Reset options when type changes
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // Convert index to A, B, C, etc.
  }

  submitForm() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.questionForm.value,
      id: this.questionId,
      userGroup: this.userGroup,
      isActive: 1,
    };

    const newPayload = this.formatePayload(payload);
    this.spinner.show();
    this.subPoliciesService.updateQuestion(newPayload).subscribe(
      (response) => {
        this.spinner.hide();

        this.notificationService.showSuccess(
          response?.message || 'Questions Edit successfully'
        );
        this.location.back();
      },
      (error) => {
        this.spinner.hide();
        this.notificationService.showError(
          error?.error?.message || 'Something went wrong!'
        );
      }
    );
  }

  formatePayload(payload: any) {
    if (payload?.options?.length > 0) {
      const optionList: any[] = [];

      payload.options.forEach((option: any, index: number) => {
        const data = {
          index: index,
          value: option,
        };
        optionList.push(data);
      });

      // Update payload with formatted options
      if (Array.isArray(payload.answer)) {
        // Convert answer array to index values based on options list
        const selectedIndexes = payload.answer.map((ans: any) =>
          optionList.findIndex((opt) => opt.value === ans)
        );

        if (payload.questionType === '1') {
          payload.answer = selectedIndexes.join(',');
        } else {
          payload.answer =
            selectedIndexes.length > 0 ? selectedIndexes[0].toString() : -1;
        }
      }
      payload.options = optionList;
    }

    return payload;
  }

  back() {
    this.location.back();
  }
}
