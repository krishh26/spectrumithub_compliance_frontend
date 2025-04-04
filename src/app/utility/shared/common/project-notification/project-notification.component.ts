import { NotificationService } from 'src/app/services/notification/notification.service';
import { Component, OnInit } from '@angular/core';
import { pagination } from '../../constant/pagination.constant';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-project-notification',
  templateUrl: './project-notification.component.html',
  styleUrls: ['./project-notification.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, NgbModule]
})
export class ProjectNotificationComponent implements OnInit {
  showLoader: boolean = false;
  projectNotificationList: any = [];
  page: number = pagination.page;
  pagesize = pagination.itemsPerPage;
  totalRecords: number = pagination.totalRecords;
  loginUser: any;

  constructor(
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
  }
}
