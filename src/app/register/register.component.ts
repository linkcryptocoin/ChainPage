import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';
import { AlertService, UserService, OothService } from '../_services/index';
import { resolve } from 'q';
import { Observable } from 'rxjs/Observable';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Validators, AbstractControl, NG_VALIDATORS } from '@angular/forms';
@Component({
    moduleId: module.id.toString(),
    templateUrl: 'register.component.html',
    styleUrls: ['./register.component.css']
})


export class RegisterComponent {

    model: any = {};
    loading = false;
    passcode: string;
    strong: boolean = false;


    constructor(
        private oothService: OothService, private toasterService: ToasterService,
        private userService: UserService,
        private alertService: AlertService) {

    }

    CheckStrength() {
        this.strong = false;
        this.passcode = this.model.password;
        console.log('--------------entered value---------- ' + this.model.password);

        const hasNumber = /\d/.test(this.model.password);
        const hasUpper = /[A-Z]/.test(this.model.password);
        const hasLower = /[a-z]/.test(this.model.password);
        console.log('Num, Upp, Low', hasNumber, hasUpper, hasLower);
        const valid = hasNumber && hasUpper && hasLower;
        if (!valid) {
            this.strong = false;
        } else {
            this.strong = true;
        }

        console.log('--------------entered value---------- ' + this.strong);
    }

    register() {
        console.log(this.model.email);
        this.oothService.register(this.model.userName, this.model.email, this.model.password, this.model.type, this.model.region, this.model.referral)
            .then(res => {
                //if (res && res === 'error') {
                if (res && res.status === 'error') {
                    // console.log("error: "+res.status)
                    //this.toasterService.pop("error", res);
                    this.toasterService.pop("error", res.message);
                    this.loading = false;
                }
                else {
                    this.toasterService.pop('success', 'Register successful')
                }
            })
            .catch(error => {
                this.toasterService.pop("error", error);
                this.loading = false;
            });
    }
}
