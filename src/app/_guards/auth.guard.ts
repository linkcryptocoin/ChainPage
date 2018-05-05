import { Injectable, Output } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OothService } from '../_services/index';
import { Globals } from '../globals'
import { EventEmitter } from 'protractor';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { environment } from '../../environments/environment';
@Injectable()
export class AuthGuard implements CanActivate {
    //@Output() onLogout = new EventEmitter();
    constructor(private oothService: OothService, private toasterService: ToasterService,
        private globals: Globals, private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log("oothtoken = "+sessionStorage.getItem("oothtoken"));
        if (sessionStorage.getItem("oothtoken") != "" && sessionStorage.getItem("oothtoken") != null
            && sessionStorage.getItem("oothtoken") != undefined) {
            // console.log(this.oothService.getUser());
            console.log("calling VerifyToken()");
            this.VerifyToken();
            return true;
        }
        // if (this.isValidSession()) {
        //     this.resetSessionTimeout();
        //     return true;
        // }
        // else{
        //     // this.toasterService.pop('error', 'Session expired');
        //     this.oothService.Logout();
        //     //this.onLogout.emit("logout");
        // }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
    private isValidSession(): boolean {
        // Check if current date is greater
        // than expiration and user is logged in
        const expiresAt = JSON.parse(sessionStorage.getItem('expires_at'));
        console.log("original exp: " + expiresAt);
        return Date.now() < expiresAt;
    }
    private resetSessionTimeout() {
        let expiresAt = Date.now() + environment.inactivitySec * 1000;
        console.log("New exp: " + expiresAt);
        sessionStorage.setItem("expires_at", expiresAt.toString());
    }
    VerifyToken() {
        return this.oothService.onVerify().then(res => {
            console.log(res);
        });
    }
}