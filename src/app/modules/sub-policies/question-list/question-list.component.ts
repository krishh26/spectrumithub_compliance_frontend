import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QUESTION_TYPE } from 'src/app/common/enum/question-type.enum';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import Swal from 'sweetalert2';
import { BulyEntryQuestionComponent } from '../buly-entry-question/buly-entry-question.component';
import { pagination } from 'src/app/utility/shared/constant/pagination.constant';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
})
export class QuestionListComponent implements OnInit {
  subPolicyId: string | null = null;
  userGroup: string | null = null;
  showLoader: boolean = false;
  questions: any[] = [];
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  searchText: FormControl = new FormControl();
  settingDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private router: Router,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.subPolicyId = params['subPoliciesId'];
      this.userGroup = params['userGroup'];

      if (this.subPolicyId && this.userGroup) {
        this.getQuestionList();
        this.getSettingDetails();
      }
    });
    this.searchText.valueChanges.subscribe(() => {
      this.getQuestionList();
    });
  }

  getSettingDetails(id?: string) {
    const payload = {
      subPolicyId: this.subPolicyId
    }

    this.subPoliciesService.getPolicySetting(payload).subscribe((response) => {
      if (response?.data) {
        this.settingDetails = response?.data || {};
      } else {

      }
    }, (error) => { this.notificationService.showError("Policy Setting Not Found !") })
  }

  paginate(page: number) {
    this.page = page;
    this.getQuestionList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  openAddTeamModal() {
    const modalRef = this.modalService.open(BulyEntryQuestionComponent, { size: 'l' });
    // Pass data like this
    modalRef.componentInstance.subPolicyId = this.subPolicyId;
    modalRef.componentInstance.userGroup = this.userGroup;
  }

  getQuestionList() {
    this.spinner.show();
    const payload = {
      subPolicyId: this.subPolicyId,
      userGroup: this.userGroup,
      pageNumber: this.page,
      pageLimit: this.pagesize,
      searchText: this.searchText.value
    };

    this.subPoliciesService.getQuestionList(payload).subscribe(
      (response) => {
        this.spinner.hide();
        if (response?.data) {
          this.questions = response?.data?.questionList?.map((question: any) => ({
            answers: question?.answer?.split(',').map((str: string) => Number(str.trim())),
            id: question._id,
            questionText: question.questionText, // Corrected property name
            questionType: this.getAnswerType(question.questionType), // Mapped to readable type
            options: question.optionsDetails?.map((option: any) => ({
              index: option?.optionIndex,
              text: option?.optionText,
            })) || [],
          }));
          this.totalRecords = response?.data?.count || 0;

        } else {
          this.questions = [];
        }
      },
      (error) => {
        this.spinner.hide();
        this.questions = [];
        if (error?.status !== 404) {
          this.notificationService.showError(
            error?.error?.message || 'Something went wrong!'
          );
        }
      }
    );
  }

  back() {
    this.location.back();
  }

  editQuestion(id: number) {
    this.router.navigate(['/sub-policies/edit-question'], {
      queryParams: {
        questionId: id,
        userGroup: this.userGroup,
      },
    });
  }

  deleteQuestion(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this Question ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4285F4',
      cancelButtonColor: '#C8C8C8',
      confirmButtonText: 'Yes, Delete!',
    }).then((result: any) => {
      if (result?.value) {
        this.spinner.show();
        const payload = { id: id };
        this.subPoliciesService.deleteQuestion(payload).subscribe(
          (response) => {
            this.spinner.hide();
            this.notificationService.showSuccess(
              'Delete Question successfully'
            );
            this.getQuestionList();
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

  createQuestion() {
    this.router.navigate(['/sub-policies/create-question'], {
      queryParams: {
        subPoliciesId: this.subPolicyId,
        userGroup: this.userGroup,
      },
    });
  }

  getOptionLabel(index: number): string {
    const labels = ['a', 'b', 'c', 'd']; // Define static labels
    return labels[index] || String.fromCharCode(97 + index); // Fallback for more options
  }
}
