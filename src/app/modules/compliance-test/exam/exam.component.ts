import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';


@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css']
})
export class ExamComponent {
  subPolicyId: any;
  showLoader: boolean = false;
  settingDetails: any = {};
  selectInstructions: any;
  loginUser: any;
  questions: any[] = []; // Question list
  currentQuestionIndex: number = 0;
  answers: any[] = [];
  timeLeft: number = 600; // 10 minutes in seconds
  timerInterval: any;
  hasReloaded = false;
  tabId = '';

  constructor(
    private route: ActivatedRoute,
    private subPoliciesService: SubPoliciesService,
    private notificationService: NotificationService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {
    this.loginUser = this.localStorageService.getLogger();
    this.route.paramMap.subscribe((params) => {
      this.subPolicyId = params.get('id');
      if (this.subPolicyId) {
        this.getPolicySettingDetails();
      }
    });
  }

  @HostListener('document:copy', ['$event'])
  disableCopy(event: ClipboardEvent) {
    event.preventDefault();
    alert("Copying content is disabled!");
  }

  getPolicySettingDetails() {
    this.spinner.show();
    this.subPoliciesService.getPolicySetting({ subPolicyId: this.subPolicyId }).subscribe((response) => {
      if (response?.statusCode == 200) {
        this.settingDetails = response?.data;
        const savedTime = localStorage.getItem('timeLeft');
        this.timeLeft = savedTime ? parseInt(savedTime) : this.settingDetails?.timeLimit * 60;
        this.loadQuestions();
      } else {
        this.notificationService.showError(response?.message || 'Policy instructions not found.');
      }
      this.spinner.hide();
    }, (error) => {
      this.notificationService.showError(error?.error?.message || 'Policy instructions not found.');
      this.spinner.hide();
    })
  }

  getQuestionList() {
    const payload = {
      subPolicyId: this.subPolicyId,
      isActive: 1,
      userGroup: this.loginUser.role == "LINEMANAGER" ? "2" : "1",
      size: Number(this.settingDetails?.maximumQuestions) || 0
    }
    this.spinner.show();
    this.subPoliciesService.getQuestionList(payload).subscribe((response) => {
      this.spinner.hide();
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        if (!response?.data) {
          return this.notificationService.showError('Questions not found.');
        }
        this.questions = response?.data?.questionList;
        // if (this.questions?.[0] == null || this.questions?.length == 0) {
        //   return this.notificationService.showError('Questions not found.');
        // }
        localStorage.setItem('questions', JSON.stringify(this.questions));
      } else {
        // this.notificationService.showError('Questions not found.');
      }
    }, (error) => {
      this.spinner.hide();
      // this.notificationService.showError(error?.error?.message || 'Questions not found.');
    })
  }

  ngAfterViewInit() {
    window.addEventListener('beforeunload', () => {
      const openTabs = JSON.parse(localStorage.getItem('appTabs') || '[]');
      const updatedTabs = openTabs.filter((id: string) => id !== this.tabId);
      localStorage.setItem('appTabs', JSON.stringify(updatedTabs));
    });
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleTabChange.bind(this));

    const openTabs = JSON.parse(localStorage.getItem('appTabs') || '[]');
    const updatedTabs = openTabs.filter((id: string) => id !== this.tabId);
    localStorage.setItem('appTabs', JSON.stringify(updatedTabs));

    this.completeExam(false);
    clearInterval(this.timerInterval);
    this.resetLocal();
    sessionStorage.removeItem('hasVisitedExamOnce');
  }

  ngOnInit() {
    this.tabId = this.generateTabId();
    sessionStorage.setItem('tabId', this.tabId);
    this.registerTab();
    window.addEventListener('storage', this.handleTabChange.bind(this));

    // Don't redirect anymore on reload
    const visited = sessionStorage.getItem('hasVisitedExamOnce');

    this.loadAnswers();
    this.loadQuestions();

    // Restore current question index if saved
    const savedIndex = localStorage.getItem('currentQuestionIndex');
    this.currentQuestionIndex = savedIndex ? parseInt(savedIndex) : 0;

    // Restore time from localStorage
    const savedTime = localStorage.getItem('timeLeft');
    this.timeLeft = savedTime ? parseInt(savedTime) : this.settingDetails?.timeLimit * 60;

    this.startTimer();

    sessionStorage.setItem('hasVisitedExamOnce', 'true');
  }

  generateTabId(): string {
    return 'tab_' + Math.random().toString(36).substr(2, 9);
  }

  registerTab() {
    const openTabs = JSON.parse(localStorage.getItem('appTabs') || '[]');
    openTabs.push(this.tabId);
    localStorage.setItem('appTabs', JSON.stringify(openTabs));
  }

  handleTabChange(event: StorageEvent) {
    if (event.key === 'appTabs') {
      const openTabs = JSON.parse(event.newValue || '[]');
      const isCurrentTabStillFirst = openTabs[0] === this.tabId;

      if (!isCurrentTabStillFirst) {
        // Another tab has opened — take action in this one
        sessionStorage.removeItem('hasVisitedExamOnce');
        location.reload(); // or use this.router.navigateByUrl(...)
      }
    }
  }
  handleStorageChange(event: StorageEvent) {
    if (event.key === 'exam-opened-timestamp') {
      // Another tab just opened the exam
      // This tab should consider itself invalid and redirect
      if (sessionStorage.getItem('hasVisitedExamOnce')) {
        sessionStorage.removeItem('hasVisitedExamOnce');
        this.router.navigateByUrl('/compliance-test/outstanding');
      }
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        localStorage.setItem('timeLeft', this.timeLeft.toString());
      } else {
        this.router.navigateByUrl('/compliance-test/outstanding');
      }
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  loadQuestions() {
    this.questions = JSON.parse(localStorage.getItem('questions')!) || []; // Load from localStorage or API
    if (this.questions?.length == 0) {
      this.getQuestionList();
    }
  }

  loadAnswers() {
    this.answers = JSON.parse(localStorage.getItem('answers')!) || [];
  }

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(optionIndex: number) {
    const questionId = this.currentQuestion._id;
    const existingAnswer = this.answers.find((a) => a.questionId === questionId);

    if (this.currentQuestion.questionType == '1') {
      // Multiple choice (checkbox)
      if (!existingAnswer) {
        this.answers.push({ questionId, answer: [optionIndex] });
      } else {
        const index = existingAnswer.answer.indexOf(optionIndex);
        if (index > -1) {
          existingAnswer.answer.splice(index, 1);
        } else {
          existingAnswer.answer.push(optionIndex);
        }
      }
    } else {
      // Single choice (radio)
      if (existingAnswer) {
        existingAnswer.answer = optionIndex;
      } else {
        this.answers.push({ questionId, answer: optionIndex });
      }
    }

    localStorage.setItem('answers', JSON.stringify(this.answers));
  }

  isOptionSelected(optionIndex: number): boolean {
    this.loadAnswers();
    const existingAnswer = this.answers.find((a) => a.questionId === this.currentQuestion._id);
    return existingAnswer?.answer?.includes?.(optionIndex) || existingAnswer?.answer === optionIndex;
  }

  nextQuestion() {
    this.loadAnswers();
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      localStorage.setItem('currentQuestionIndex', this.currentQuestionIndex.toString());
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      localStorage.setItem('currentQuestionIndex', this.currentQuestionIndex.toString());
    }
  }

  completeExam(showValidation: boolean) {
    if (this.answers?.length == 0 && showValidation) {
      return this.notificationService.showError("Please select one answers");
    }
    const transformedArray: any[] = this.answers?.map(item => ({
      questionId: item.questionId,
      answer: Array.isArray(item.answer) ? item.answer.join(",") : item.answer.toString()
    }));

    const duration = (Number(localStorage.getItem('timeLeft')) !== 0 && localStorage.getItem('timeLeft')) ? (Number(localStorage.getItem('timeLeft')) / 60) : 0;

    console.log('tesitnf data', localStorage.getItem('timeLeft'));
    console.log('tesitnf data', duration);

    this.questions?.forEach((element: any) => {
      const existing = transformedArray?.find((el) => el?.questionId == element?._id);
      if (!existing) {
        transformedArray.push({
          questionId: element?._id,
          answer: "null"
        })
      }
    })

    clearInterval(this.timerInterval);
    const payload = {
      subPolicyId: this.subPolicyId,
      userGroup: this.loginUser.role == "LINEMANAGER" ? "2" : "1",
      passingScore: this.settingDetails?.PassingScore,
      marksPerQuestion: this.settingDetails?.maximumScore,
      duration: (duration !== 0 && !!duration) ? Number(this.settingDetails?.timeLimit) - Number(duration) : Number(this.settingDetails?.timeLimit),
      answers: transformedArray
    }

    console.log("Testing details", payload);

    this.spinner.show();
    this.subPoliciesService.saveAnswer(payload).subscribe((response) => {
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        localStorage.removeItem('answers');
        localStorage.removeItem('questions');
        localStorage.removeItem('timeLeft');
        localStorage.removeItem('hasVisitedExamOnce');
        this.notificationService.showSuccess('Test result submitted.');
        this.router.navigateByUrl('/compliance-test/outstanding');
      } else {
        this.notificationService.showError(response?.message || 'Something went wrong !');
      }
      this.spinner.hide();
    }, (error) => {
      this.notificationService.showError(error?.error?.message || 'Something went wrong !');
      this.spinner.hide();
    });
  }

  get progressPercent(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  resetLocal() {
    localStorage.removeItem('answers');
    localStorage.removeItem('questions');
    localStorage.removeItem('timeLeft');
    localStorage.removeItem('currentQuestionIndex');
  }
}
