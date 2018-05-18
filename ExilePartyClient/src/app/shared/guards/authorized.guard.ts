import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CanActivateAuthorized {

    constructor(private http: HttpClient, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return localStorage.getItem('sessionId') !== null;
    }

    checkActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return localStorage.getItem('sessionId') !== null;
    }
}
