import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
//import { environment } from '../../environments/environment';

import { environment } from 'src/environments/environment';


const AUTH_BASE_API = environment.apiURL + '/api/auth'

export interface AuthResponseData {
  reservationId: string;
  token: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  reservationId: string = '';
  user = new BehaviorSubject<User>(new User('', '', new Date()));
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  autoLogin() {
    const localStorageData = localStorage.getItem('userData');
    if (!localStorageData) {
      return;
    }
    const userData: any | undefined = JSON.parse(localStorageData);
    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.reservationId, userData._token, new Date(userData._tokenExpirationDate));

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    } 
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  logout() {
    this.user.next(new User('', '', new Date()));
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  getAuthToken(reservationId: string) {
    return this.http.get<AuthResponseData>(`${AUTH_BASE_API}/` + reservationId + '/token')
    .pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handleAuthentication(
          resData.reservationId,
          resData.token,
          +resData.expiresIn
        );
      })
    );
  }

  private handleAuthentication(
    reservationId: string,
    token: string,
    expiresIn: number
  ) {
    this.reservationId = reservationId;
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(reservationId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    // switch (errorRes.error.error.message) {
    //   case 'EMAIL_EXISTS':
    //     errorMessage = 'This email exists already';
    //     break;
    //   case 'EMAIL_NOT_FOUND':
    //     errorMessage = 'This email does not exist.';
    //     break;
    //   case 'INVALID_PASSWORD':
    //     errorMessage = 'This password is not correct.';
    //     break;
    // }
    return throwError(errorMessage);
  }

}
