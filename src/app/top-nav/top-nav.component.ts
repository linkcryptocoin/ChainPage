import { Component, OnInit } from '@angular/core';
import { User, Claim } from '../_models/index';
import { Http, Response } from '@angular/http';
import { OothService, AlertService } from '../_services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
@Component({
  moduleId: module.id.toString(),
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  currentUser: string = undefined;
  currentUserAccount: string = undefined;
  selectedLanguage = "2";
  language: any[] = [];
  elementType : 'url' | 'canvas' | 'img' = 'url';
  tokenBalance: number = 0;
  constructor(private http: Http, private alertService: AlertService, private toasterService: ToasterService,
    private oothService: OothService, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService) {
    this.currentUser = sessionStorage.getItem("currentUser");
    this.currentUserAccount = sessionStorage.getItem("currentUserAccount");
    this.oothService.getLoggedInName
      .subscribe(name => {
          this.currentUser = name;
      });
      this.oothService.getLoggedInAccount
      .subscribe(account => {
        this.currentUserAccount = account;
        console.log("account: " + this.currentUserAccount);
      });
    this.http.get('/assets/language.json')
      .subscribe(data => {
        this.language = data.json();
      });
  }
  // get userLoggedIn(): boolean {
  //   // if (sessionStorage.getItem("currentUser")) {
  //   //   this.currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  //   //   return true;
  //   // }
  //   // return false;
  //   console.log(this.currentUser);
  //   return this.oothService.isLoggedIn;
  // }
  LogOut() {
    // reset login status
    this.oothService.Logout()
    .then(() => this.toasterService.pop('success', 'Logout successful'));
      // .then(() => this.alertService.success('Logout successful', true));
    //this.globals.isLoggedIn = false;
    this.currentUser = undefined;
    sessionStorage.setItem("oothtoken", "");
    // get return url from route parameters or default to '/'
    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigate(['/login']);
  }
  onChange(newValue) {
    //console.log(this.language.find(n => n.Id==newValue).Short);
    this.translate.setDefaultLang(this.language.find(n => n.Id == newValue).Short);
  }
  getTokenBalance()
  {
    this.oothService.getTokenBalance(this.currentUserAccount).then(balance => this.tokenBalance = balance);
  }
  ngOnInit() {
  }

}
