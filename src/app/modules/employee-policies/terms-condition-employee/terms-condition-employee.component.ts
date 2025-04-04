import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SubPoliciesService } from 'src/app/services/sub-policy/sub-policies.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-terms-condition-employee',
  templateUrl: './terms-condition-employee.component.html',
  styleUrls: ['./terms-condition-employee.component.css']
})
export class TermsConditionEmployeeComponent {
  subPolicyID!: string;
  subPolicyData!: any;
  safeDescription!: SafeHtml;
  acceptTerms: boolean = false;
  latitude!: number;
  longitude!: number;
  ipAddress: string = 'Retrieving...';
  ipAddressRetrieved: boolean = false;
  loginUser: any;
  locationDetails: { city: string; state: string } | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private subPoliciesService: SubPoliciesService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private http: HttpClient
  ) {
    this.loginUser = this.localStorageService.getLogger();
    this.getIpAddress();

    this.route.paramMap.subscribe((params) => {
      this.subPolicyID = String(params.get('id'));
      if (this.subPolicyID) {
        this.getSubPolicyDetails();
      }
    });

    this.getCurrentLocation();
  }

  @HostListener('document:copy', ['$event'])
  disableCopy(event: ClipboardEvent) {
    event.preventDefault();
    alert("Copying content is disabled!");
  }

  getSubPolicyDetails() {
    this.spinner.show();
    this.subPoliciesService.getPolicyDetails(this.subPolicyID, { employeeId: this.loginUser?._id }).subscribe((response) => {
      this.subPolicyData = response?.data?.length > 0 ? response?.data?.[0] : response?.data;
      if (this.subPolicyData?.description) {
        this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.subPolicyData.description);
      }

      // Parse location details if they exist
      if (this.subPolicyData?.conditionDetail?.location) {
        const locationStr = this.subPolicyData.conditionDetail.location;
        if (locationStr.includes('(') && locationStr.includes(')')) {
          const locationParts = locationStr.split('(')[1].split(')')[0].split(',');
          if (locationParts.length >= 2) {
            this.locationDetails = {
              city: locationParts[0].trim(),
              state: locationParts[1].trim()
            };
          }
        }
      }

      this.spinner.hide();
    }, (error) => {
      this.spinner.hide();
      this.notificationService.showError(error?.error?.message || 'Something went wrong!');
    }
    );
  }

  submitTerms() {
    if (!this.acceptTerms) {
      return this.notificationService.showError('Please select acceptance checkbox !');
    }

    if (!this.ipAddressRetrieved) {
      this.getIpAddress(() => {
        this.acceptTermsAndCondition();
      });
    } else {
      this.acceptTermsAndCondition();
    }
  }

  openMap(location: string): void {
    if (!location) return;

    // Extract just the coordinates part (before any parentheses)
    const coordinatesPart = location.split('(')[0].trim();
    const [lat, lon] = coordinatesPart.split(',').map(coord => coord.trim());

    if (lat && lon) {
      // Get city name from coordinates
      this.getLocationNameFromCoordinates(lat, lon);
    } else {
      console.error('Invalid location format');
    }
  }

  getLocationNameFromCoordinates(lat: string, lon: string): void {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        if (response && response.address) {
          const city = response.address.city || response.address.town || response.address.village || 'Unknown City';
          const state = response.address.state || 'Unknown State';

          // Open Google Maps with the coordinates and city name
          const url = `https://www.google.com/maps?q=${lat},${lon}&title=${city}, ${state}`;
          window.open(url, '_blank');
        } else {
          // Fallback to just coordinates if city name can't be determined
          const url = `https://www.google.com/maps?q=${lat},${lon}`;
          window.open(url, '_blank');
        }
      },
      error: (error) => {
        console.error('Error getting location details:', error);
        // Fallback to just coordinates if there's an error
        const url = `https://www.google.com/maps?q=${lat},${lon}`;
        window.open(url, '_blank');
      }
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.getLocationDetails(this.latitude, this.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  getLocationDetails(lat: number, lon: number) {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        if (response && response.address) {
          this.locationDetails = {
            city: response.address.city || response.address.town || response.address.village || 'Unknown City',
            state: response.address.state || 'Unknown State'
          };
        }
      },
      error: (error) => {
        console.error('Error getting location details:', error);
        this.locationDetails = null;
      }
    });
  }

  acceptTermsAndCondition() {
    if (!this.ipAddressRetrieved) {
      this.notificationService.showError("Could not determine your IP address. Please refresh the page and try again.");
      return;
    }

    Swal.fire({
      title: 'Confirmation',
      text: `I have read all the instructions carefully and have understood them.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#007C00',
      cancelButtonColor: '#F7454A',
      confirmButtonText: 'Accept',
    }).then((result: any) => {
      if (result?.value) {
        this.spinner.show();
        const payload = {
          employeeId: this.loginUser?._id,
          subPolicyId: this.subPolicyID,
          ipAddress: this.ipAddress,
          location: this.latitude && this.longitude ?
            `${this.latitude},${this.longitude}${this.locationDetails ? ` (${this.locationDetails.city}, ${this.locationDetails.state})` : ''}` :
            "Location not available"
        };

        this.subPoliciesService.acceptTerms(payload).subscribe(
          (response) => {
            this.spinner.hide();
            if (response?.statusCode == 200 || response?.statusCode == 201) {
              this.notificationService.showSuccess('Accept Successfully');
              this.getSubPolicyDetails();
            } else {
              this.notificationService.showError("Please retry !");
            }
          }, (error) => {
            this.spinner.hide();
            this.notificationService.showError(error?.error?.message || 'Something went wrong!');
          }
        );
      } else {
        this.acceptTerms = false;
      }
    });
  }

  getIpAddress(callback?: () => void) {
    this.subPoliciesService.getCurrentIp().subscribe({
      next: (response) => {
        if (response?.ip) {
          this.ipAddress = response.ip;
          this.ipAddressRetrieved = true;
          console.log('Current IP address:', this.ipAddress);
        } else {
          this.getIpAddressFallback1(callback);
        }

        if (callback) {
          callback();
        }
      },
      error: (err) => {
        console.error('Failed to get IP from primary service:', err);
        this.getIpAddressFallback1(callback);
      },
    });
  }

  getIpAddressFallback1(callback?: () => void) {
    this.subPoliciesService.getFallbackIp().subscribe({
      next: (response: any) => {
        if (response?.ip) {
          this.ipAddress = response.ip;
          this.ipAddressRetrieved = true;
          console.log('Fallback IP address 1:', this.ipAddress);
        } else {
          this.getIpAddressFallback2(callback);
        }

        if (callback) {
          callback();
        }
      },
      error: (err: any) => {
        console.error('Failed to get IP from fallback service 1:', err);
        this.getIpAddressFallback2(callback);
      }
    });
  }

  getIpAddressFallback2(callback?: () => void) {
    this.ipAddress = window.location.hostname || 'client-ip-unknown';
    this.ipAddressRetrieved = true;

    if (callback) {
      callback();
    }
  }

  goBack() {
    window.history.back();
  }
}
