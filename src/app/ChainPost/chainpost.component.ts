import { Component, OnInit, Input , AnimationTransitionEvent} from '@angular/core';
import { UserService, ClaimService, AlertService, BigchanDbService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../_services/index';
import { User, Claim } from '../_models/index';
import { forEach } from '@angular/router/src/utils/collection';
import { Globals } from '../globals'
import { Observable } from 'rxjs/Observable';
// import { HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import { filter } from 'rxjs/operators';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    moduleId: module.id.toString(),
    templateUrl: './chainpost.component.html',
    styleUrls: ['./chainpost.component.css']
})

export class ChainPostComponent implements OnInit {
 private _opened: boolean = false;
 categories: any[] = [];

 private _toggleSidebar() {
    // console.log("shout out from toggle bar");
    this._opened = !this._opened;
  }

  private CloseSidebar(){
     //  console.log("shout out from cloooooose toggle bar");
      this._opened = this._opened;

  }
    constructor(private http: Http, private globals: Globals,
    private authenticationService: AuthenticationService, private router: Router,private route: ActivatedRoute, private translate: TranslateService) {

    //console.log("side-nav: " + globals.isLoggedIn);
    // if (this.currentUser != undefined) {
    //   console.log(this.currentUser.username);
    // }
    // else{console.log("side-nav: no user")}
    this.http.get('/assets/postcat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);
      });


    }


    ngOnInit() { }
}
