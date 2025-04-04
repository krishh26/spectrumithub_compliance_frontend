import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QUESTION_TYPE } from 'src/app/common/enum/question-type.enum';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import Swal from 'sweetalert2';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-show-exam-questions-admin',
  templateUrl: './show-exam-questions-admin.component.html',
  styleUrls: ['./show-exam-questions-admin.component.css']
})
export class ShowExamQuestionsAdminComponent {
  resultId: string | null = null;
  questions: any[] = [];
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  acceptTermsDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.resultId = params.get('id');
      this.getQuestionList();
    });
  }

  paginate(page: number) {
    this.page = page;
    this.getQuestionList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getQuestionList() {
    const payload = {
      resultId: this.resultId,
      pageNumber: this.page,
      pageLimit: this.pagesize,
    };
    this.spinner.show();
    this.questions = [];
    this.subPoliciesService.getTestQuestionList(payload).subscribe(
      (response) => {
        if (response?.data) {
          this.questions = response?.data?.answerList || [];
          this.getAcceptTermsConditionDetails(this.questions?.[0]?.subPolicyId, this.questions?.[0]?.employeeId);
          this.questions?.map((element) => {
            element['answers'] = element?.answer?.split(',').map((str: string) => Number(str.trim()))
          })
          this.totalRecords = response?.data?.count || 0;
        } else {
          this.questions = [];
        }
        this.spinner.hide();
      },
      (error) => {
        this.questions = [];
        if (error?.status !== 404) {
          this.notificationService.showError(
            error?.error?.message || 'Something went wrong!'
          );
        }
        this.spinner.hide();
      }
    );
  }

  openMap(location: string): void {
    if (!location) return;

    const [lat, lon] = location.split(',').map(coord => coord.trim());

    if (lat && lon) {
      const url = `https://www.google.com/maps?q=${lat},${lon}`;
      window.open(url, '_blank');
    } else {
      console.error('Invalid location format');
    }
  }

  back() {
    this.location.back();
  }

  getAnswerType(questionType: string): string {
    switch (questionType) {
      case QUESTION_TYPE.CHECKBOX:
        return 'Multiple Choice';
      case QUESTION_TYPE.BOOLEAN:
        return 'Boolean';
      case QUESTION_TYPE.MCQ:
        return 'Single Choice';
      default:
        return 'Unknown';
    }
  }

  getAnswer(index: any, options: any) {
    let result: string = "";
    index = index?.split(',').map((str: string) => Number(str.trim()));
    options?.map((element: any) => {
      if (index?.includes(element?.optionIndex)) {
        if (result) {
          result = String(result) + ',' + String(element?.optionText);
        } else {
          result = String(element?.optionText);
        }
      }
    })
    return result;
  }

  getOptionLabel(index: number): string {
    const labels = ['a', 'b', 'c', 'd']; // Define static labels
    return labels[index] || String.fromCharCode(97 + index); // Fallback for more options
  }


  getAcceptTermsConditionDetails(subPolicyId: string, employeeId: string) {
    const payload = {
      subPolicyId,
      employeeId
    }
    this.spinner.show();
    this.subPoliciesService.getAcceptTermsDetails(payload).subscribe((response) => {
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        this.acceptTermsDetails = response?.data?.detail || {};
      } else {
        this.notificationService.showError(response?.message || 'Something went wrong!');
      }
      this.spinner.hide();
    }, (error) => {
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
      this.spinner.hide();
    });
  }

  // Helper method to check if an option is a correct answer
  isCorrectAnswer(answerStr: string, optionIndex: number): boolean {
    if (!answerStr) return false;
    const correctAnswers = answerStr.split(',').map(str => Number(str.trim()));
    return correctAnswers.includes(optionIndex);
  }

  // Helper method to check if user answered differently from correct answer
  hasUserAnsweredDifferently(question: any): boolean {
    if (!question?.answers || !question?.questionDetails?.[0]?.answer) return false;

    const userAnswers = question.answers;
    const correctAnswers = question.questionDetails[0].answer.split(',').map((str: string) => Number(str.trim()));

    // Check if arrays have different lengths
    if (userAnswers.length !== correctAnswers.length) return true;

    // Check if arrays have different content
    for (const answer of userAnswers) {
      if (!correctAnswers.includes(answer)) return true;
    }

    for (const answer of correctAnswers) {
      if (!userAnswers.includes(answer)) return true;
    }

    return false;
  }
}
