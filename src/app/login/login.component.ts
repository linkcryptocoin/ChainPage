import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService, OothService } from '../_services/index';
import {Globals} from '../globals'
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
@Component({
    moduleId: module.id.toString(),
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    model: any = {};
    loading = false;
    returnUrl: string;

    constructor(
        private globals: Globals, private oothService: OothService,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private toasterService: ToasterService) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    login(){
        // this.loading = true;
        // // this.globals.isLoggedIn = true;
        // // sessionStorage.setItem("isLoggedIn", "true");
        // //console.log("login: " + this.globals.isLoggedIn);
        // this.authenticationService.login(this.model.username, this.model.password)
        //     .subscribe(
        //         data => {
        //             console.log(data)
        //             this.router.navigate([this.returnUrl]);
        //         },
        //         error => {
        //             this.alertService.error(error);
        //             this.loading = false;
        //         });
        //console.log('login')
        this.oothService.Logout();        
        this.oothService.Login(this.model.email, this.model.password)
        .then(res => {//console.log(this.model.email + " " + this.model.password)
            if(res.status  === 'error'){
                // console.log("error: "+res.status)
                this.toasterService.pop("error", res.message)
                this.loading = false;
            }
            else{
                console.log("redirect to: "+this.returnUrl)
                this.router.navigate([this.returnUrl]);
            }
        });
    }
}
