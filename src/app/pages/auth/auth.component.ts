import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})

export class AuthComponent implements OnInit,OnDestroy {
  reservationId: any = '';//new FormControl('', [Validators.required]);
  userSubscription: Subscription | undefined;
  formGroup = this.formBuilder.group({
    'reservationId': [null, Validators.required]
  });
  
  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getErrorMessage() {
    if (this.reservationId.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }

  onSubmit(formGroup: FormGroup) {
    this.reservationId = formGroup.value;
    this.userSubscription = this.authService.getAuthToken(this.reservationId.reservationId).subscribe(resData => {
      this.router.navigate(['/home']);
    })
    formGroup.reset();
  }

}
