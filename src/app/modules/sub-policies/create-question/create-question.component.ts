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
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css'],
})
export class CreateQuestionComponent {
  questionForm!: FormGroup;
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
  subPolicyId: string | null = null;
  userGroup: string | null = null;
  constructor(
    private fb: FormBuilder,
    private location: Location,
    private subPoliciesService: SubPoliciesService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.subPolicyId = params['subPoliciesId'];
      this.userGroup = params['userGroup'];
    });
  }

  initializeForm() {
    this.questionForm = this.fb.group({
      questions: this.fb.array([]),
    });

    this.addNewQuestion(); // Start with one question
  }

  get questions() {
    return this.questionForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number) {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addNewQuestion() {
    const newQuestion = this.fb.group({
      questionText: ['', Validators.required],
      questionType: ['3', Validators.required],
      options: this.fb.array([]),
      isActive: ['1', Validators.required],
      answer: ['', Validators.required],
    });

    this.questions.push(newQuestion);
    this.setDefaultOptions(this.questions.length - 1);
  }

  setDefaultOptions(questionIndex: number) {
    const type = this.questions.at(questionIndex).get('questionType')?.value;
    const optionsArray = this.getOptions(questionIndex);
    optionsArray.clear();

    let defaultAnswer = ''; // Store default answer

    if (type === '3') {
      // MCQ: Always 4 fixed options
      const mcqOptions = ['', '', '', ''];
      mcqOptions.forEach((option, index) => {
        optionsArray.push(new FormControl(option, Validators.required));
        if (index === 0) defaultAnswer = option; // Set first option as default
      });
    } else if (type === '2') {
      // Boolean: Always Yes & No
      const booleanOptions = ['', ''];
      booleanOptions.forEach((option, index) => {
        optionsArray.push(new FormControl(option, Validators.required));
        if (index === 0) defaultAnswer = option; // Set first option as default
      });
    } else if (type === '1') {
      // Multiple Choice: Starts with 4 options
      const multipleOptions = ['', '', '', ''];
      multipleOptions.forEach((option, index) => {
        optionsArray.push(new FormControl(option, Validators.required));
        if (index === 0) defaultAnswer = option; // Set first option as default
      });
    }

    // Set the first option as the default answer
    // this.questions.at(questionIndex).patchValue({ answer: defaultAnswer });
  }

  onTypeChange(questionIndex: number) {
    this.setDefaultOptions(questionIndex);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getAnswerList(index: number) {
    return this.questions.at(index).get('options')?.value;
  }
  submitForm(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched(); // Show errors
      return;
    }
    this.spinner.show();
    const payload = {
      ...this.questionForm.value,
      subPolicyId: this.subPolicyId,
      userGroup: this.userGroup,
    };

    const newPayload = this.formatePayload(payload);
    this.spinner.show();
    this.subPoliciesService.createQuestion(newPayload).subscribe(
      (response) => {
        this.spinner.hide();

        this.notificationService.showSuccess(
          response?.message || 'Questions Create successfully'
        );
        this.router.navigate(['/sub-policies/question-list'], {
          queryParams: {
            subPoliciesId: this.subPolicyId,
            userGroup: this.userGroup,
          }, // Add your params here
        });
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
    payload?.questions?.forEach((element: any) => {
      if (element?.options?.length > 0) {
        const optionList: any[] = [];

        element.options.forEach((option: any, index: number) => {
          optionList.push({ index: index, value: option });
        });
        if (Array.isArray(element.answer)) {
          // Convert answer array to index values based on options list
          const selectedIndexes = element.answer.map((ans: any) =>
            optionList.findIndex((opt) => opt.value === ans)
          );

          if (element.questionType === '1') {
            element.answer = selectedIndexes.join(',');
          } else {
            element.answer =
              selectedIndexes.length > 0 ? selectedIndexes[0].toString() : -1;
          }
        } else {
          const index = optionList.findIndex(
            (opt) => opt.value === element.answer
          );
          element.answer = index !== -1 ? index.toString() : -1;
        }

        element.options = optionList;
      }
    });

    return payload;
  }

  back() {
    this.location.back();
  }

  getOptionLabel(index: number): string {
    const labels = ['A', 'B', 'C', 'D']; // Fixed labels
    return labels[index] || String.fromCharCode(65 + index); // Fallback for more options
  }
}
