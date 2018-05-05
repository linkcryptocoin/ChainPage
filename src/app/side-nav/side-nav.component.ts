import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User, Claim } from '../_models/index';
import { Globals } from '../globals'
import { AuthenticationService } from '../_services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  moduleId: module.id.toString(),
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  categories: any[] = [];
  returnUrl: string;

  constructor(
    private http: Http, private globals: Globals,
    private authenticationService: AuthenticationService, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService) {

    //console.log("side-nav: " + globals.isLoggedIn);
    // if (this.currentUser != undefined) {
    //   console.log(this.currentUser.username);
    // }
    // else{console.log("side-nav: no user")}

    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);
      });

  }

  ngOnInit() {
  }

}
