import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bulk-entry-employee',
  templateUrl: './bulk-entry-employee.component.html',
  styleUrls: ['./bulk-entry-employee.component.css']
})
export class BulkEntryEmployeeComponent {

  showLoader: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router,
    // private superService: SuperadminService,
    private activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService
  ) { }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      let data = <any[][]>(XLSX.utils.sheet_to_json(ws, { header: 1 }));

      // Remove the first row (A1 row) which contains headers
      const headers = data[0];
      data = data.slice(1);

      // Filter out empty arrays
      data = data.filter(row => row.length > 0);

      // Function to replace null or undefined values with empty strings
      const replaceNullWithEmptyString = (value: any) => value == null ? "" : value;

      // Function to convert Excel date serial to human-readable date
      const convertExcelDate = (serial: number) => {
        const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Excel epoch starts on 1900-01-01
        const days = Math.floor(serial - 2); // Subtract 2 to adjust for Excel leap year bug
        excelEpoch.setUTCDate(excelEpoch.getUTCDate() + days);
        return excelEpoch.toISOString().split('T')[0]; // Convert to ISO string and remove time
      };

      const jsonData = data.map(row => {
        const replaceNullWithEmptyString = (value: any) => value == null ? "" : value;

        // Convert a comma-separated string to an array, or return an empty array if the string is empty
        const parseCommaSeparatedField = (value: string) => {
          const cleanedValue = replaceNullWithEmptyString(value);
          return cleanedValue ? cleanedValue.split(',').map((item: any) => item.trim()) : [];
        };

        return {
          firstName: replaceNullWithEmptyString(row[0]),
          middleName: replaceNullWithEmptyString(row[1]),
          lastName: replaceNullWithEmptyString(row[2]),
          gender: replaceNullWithEmptyString(row[3]),
          birthDate: typeof row[4] === 'number' ? convertExcelDate(row[4]) : replaceNullWithEmptyString(row[4]),
          email: replaceNullWithEmptyString(row[5]),
          dateOfJoining: typeof row[6] === 'number' ? convertExcelDate(row[6]) : replaceNullWithEmptyString(row[6]),
          phone: replaceNullWithEmptyString(row[7]),
          alternatePhone: replaceNullWithEmptyString(row[8]),
          country: replaceNullWithEmptyString(row[9]),
          state: replaceNullWithEmptyString(row[10]),
          city: replaceNullWithEmptyString(row[11]),
          role: replaceNullWithEmptyString(row[12]),
        };
      });

      this.spinner.show();
      this.employeeService.bulkUpload(jsonData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res?.statusCode == 200 || res?.statusCode == 201) {
            this.spinner.hide();

            this.notificationService.showSuccess(res?.message);
            window.location.reload();
          } else {
            this.spinner.hide();
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

