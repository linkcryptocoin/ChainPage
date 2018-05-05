import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';
import { AlertService, UserService, OothService } from '../_services/index';
import { resolve } from 'q';
import { Observable } from 'rxjs/Observable';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
@Component({
    moduleId: module.id.toString(),
    templateUrl: 'register.component.html'
})

export class RegisterComponent {
    model: any = {};
    loading = false;

    constructor(
        private oothService: OothService, private toasterService: ToasterService,
        private userService: UserService,
        private alertService: AlertService) { }

    register() {
        // this.loading = true;
        // this.userService.create(this.model)
        //     .subscribe(
        //         data => {console.log(this.model);
        //             this.alertService.success('Registration successful', true);
        //             this.router.navigate(['/login']);
        //         },
        //         error => {
        //             this.alertService.error(error);
        //             this.loading = false;
        //         });
        // let promise = new Promise((resolve, reject) => {
        //     Observable.of(this.oothService.register(this.model.username, this.model.password))
        //     .toPromise()
        //     .then(
        //     res => { // Success
        //         console.log(res);
        //         resolve();
        //     }
        //     );
        // });
        // return promise;

        console.log(this.model.email)
        this.oothService.register(this.model.email, this.model.password)
        .then(res => {
            if(res && res  === 'error'){
                // console.log("error: "+res.status)
                this.toasterService.pop("error", res)
                this.loading = false;
            }
            else{
                this.toasterService.pop('success', 'Register successful')
            }            
        });
    }
}
