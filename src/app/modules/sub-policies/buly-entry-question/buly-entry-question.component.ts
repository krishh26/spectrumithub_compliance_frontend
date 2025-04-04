import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-buly-entry-question',
  templateUrl: './buly-entry-question.component.html',
  styleUrls: ['./buly-entry-question.component.css']
})
export class BulyEntryQuestionComponent implements OnInit {

  showLoader: boolean = false;
  subPolicyId!: string;
  userGroup: string | null = null;

  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router,
    private subPoliciesService: SubPoliciesService,
    private activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      /* Read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* Get first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* Convert sheet to JSON */
      let data = <any[][]>XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Remove header row
      const headers = data[0];
      data = data.slice(1);

      // Function to replace null or undefined values with empty strings
      const replaceNullWithEmptyString = (value: any) => value == null ? "" : value;
      const replaceQuestionType = (item: string) => {
        const value = item?.trim()?.toLowerCase();
        if (value === 'true false' || value === 'truefalse' || value === 'boolean') {
          return 2;  // Return number instead of string
        }
        if (value === 'multi choice' || value === 'multichoice' || value === 'multiple') {
          return 1;  // Return number instead of string
        }
        return 3;  // Default to single choice
      }

      const getAnswer = (answer: any, options: any, questionType: number) => {
        // If answer is undefined or null
        if (answer === undefined || answer === null) {
          // For True/False questions (type 2), default to "1" (False)
          if (questionType === 2) {
            return '1';
          }
          return '';
        }

        // Convert answer to string and trim
        const answerStr = String(answer).trim();

        // If answer is empty string
        if (answerStr === '') {
          // For True/False questions (type 2), default to "1" (False)
          if (questionType === 2) {
            return '1';
          }
          return '';
        }

        // Special handling for True/False questions
        if (questionType === 2) {
          if (answerStr.toUpperCase() === 'TRUE') {
            return '0';
          } else if (answerStr.toUpperCase() === 'FALSE') {
            return '1';
          } else {
            // If it's neither TRUE nor FALSE explicitly, default to "1" (False)
            return '1';
          }
        }

        // For other question types
        const answerArray = answerStr.split(',').map(item => item.trim());
        const matchedIndices = options
          .filter((option: any) => answerArray.includes(option.value))
          .map((option: any) => option.index.toString());

        return matchedIndices.join(',');
      }

      // Map data to API structure
      const questions = data.map(row => {
        // Extract question type and text
        const questionType = replaceQuestionType(row[0]); // Column A (questionType)
        const questionText = replaceNullWithEmptyString(row[1]); // Column B (questionText)

        let options = [];

        // Handle options based on question type
        if (questionType === 2) {
          // For True/False questions, always include both options
          options = [
            { index: 0, value: "True" },
            { index: 1, value: "False" }
          ];
        } else {
          // For other question types, extract options from Excel
          for (let i = 2; i <= 5; i++) { // Columns C to F (option1 to option4)
            if (row[i]) {
              options.push({
                index: i - 2,
                value: row[i].toString().trim()
              });
            }
          }
        }

        // Extract answer from column G (index 6)
        const answer = getAnswer(row[6], options, questionType);

        return {
          questionText,
          questionType,
          answer,
          isActive: 1,  // Number instead of string
          options,
        };
      });

      const questionsList = questions?.filter(element => !!element?.questionText);

      // Prepare payload
      const payload = {
        questions: questionsList,
        subPolicyId: this.subPolicyId,
        userGroup: Number(this.userGroup) || 1  // Convert to number
      };

      this.spinner.show();

      this.subPoliciesService.createQuestion(payload).subscribe(
        (res) => {
          this.spinner.hide();
          if (res?.statusCode == 201) {
            this.notificationService.showSuccess(res?.message);
            window.location.reload();
            this.router.navigate(['/sub-policies/question-list']);
          } else {
            this.notificationService.showError(res?.message);
          }
        },
        (error) => {
          this.spinner.hide();
          this.notificationService.showError(error?.error?.message);
        }
      );
    };

    reader.readAsBinaryString(target.files[0]);
  }


  close() {
    this.activeModal.close();
  }
}

