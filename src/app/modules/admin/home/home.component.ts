import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth/auth-service.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  loginUser: any;
  loginRole: any;
  isSidebarOpen = true; // Sidebar is open by default
  isNavbarCollapsed = true; // Navbar is collapsed by default
  currentRoute: string = '';

  constructor(
    private authService: AuthServiceService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.loginUser = this.localStorageService.getLogger();
    this.loginRole = this.loginUser.role;
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (this.isSidebarOpen) {
        sidebar.classList.remove('collapsed'); // Ensure the sidebar is visible
      } else {
        sidebar.classList.add('collapsed'); // Hide the sidebar
      }
    }
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
