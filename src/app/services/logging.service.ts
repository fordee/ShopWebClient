import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor() { }

  log(message: string) {
    const currentDate = new Date().toLocaleString();
    console.log(currentDate + ': '+ message);
  }
}
