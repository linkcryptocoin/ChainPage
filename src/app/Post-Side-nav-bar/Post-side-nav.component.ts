import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User, Claim } from '../_models/index';
import { Globals } from '../globals'
import { AuthenticationService } from '../_services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
// import { HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import { filter } from 'rxjs/operators';
import { ISubscription } from "rxjs/Subscription";
import { isNgTemplate } from '@angular/compiler';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-post-side-nav',
  templateUrl: './Post-side-nav.component.html',
  styleUrls: ['./Post-side-nav.component.css']
})
export class PostSideNavComponent implements OnInit {
  private subscription: ISubscription;
  categories: any[] = [];
 // subcategories: any[] = [];
  returnUrl: string;
  catParam = "";
//variable to hold boolean value to style1
isClass1Visible: false;
//variable to hold boolean value to style2
isClass2Visible: false;
  constructor(
    private http: Http, private globals: Globals,
    private authenticationService: AuthenticationService, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService) {

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

  


  ngOnInit() {
  }

}
