import { Component, OnInit, Output, Input, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core';
import { User, Claim } from '../_models/index';
import { Http, Response } from '@angular/http';
import { OothService, AlertService } from '../_services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { EventEmitter } from 'events';
import { getNames } from 'i18n-iso-countries';
import { Select2OptionData } from 'ng2-select2';
@Component({
  moduleId: module.id.toString(),
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  private validLocales = ['de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'ru'];
  private pleaseChoose = {
    en: 'Please choose...',
    de: 'Bitte auswählen...',
    fr: 'Choisissez s\'il vous plaît...',
    es: 'Elija por favor...',
    it: 'si prega di scegliere...',
    nl: 'Gelieve te kiezen...',
    pl: 'proszę wybrać...'
  };
  private defaultLabel: string;

  private sub: any;

  @Input()
  public iso3166Alpha2: string;

  @Input()
  public size: 'sm' | 'lg';

  @Output()
  public iso3166Alpha2Change = new EventEmitter();

  public myCountries: any[] = [];

  
  currentUser: string = undefined;
  currentUserAccount: string = undefined;
  CurrentUserName: string = undefined;
  selectedLanguage = "2";
  selectedFlag: string;
  language: any[] = [];
  elementType: 'url' | 'canvas' | 'img' = 'url';
  tokenBalance: number;
  // public languages: Array<Select2OptionData>;

  constructor(private http: Http, private alertService: AlertService, private toasterService: ToasterService,
    private oothService: OothService, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    @Inject(LOCALE_ID) private localeId: string) {

      let locale = 'en';

    if (this.localeId.length > 2) {
      // convert Locale from ISO 3166-2 to ISO 3166 alpha2
      locale = this.localeId.toLowerCase().slice(0, 2);
    } else {
      locale = this.localeId.toLowerCase();
    }

    if (this.validLocales.indexOf(locale) > -1) {
      this.loadCountries(locale);
    } else {
      this.loadCountries('en'); // fallback locale is english
    }
    this.defaultLabel = this.pleaseChoose.hasOwnProperty(locale) ? this.pleaseChoose[locale] : this.pleaseChoose.en;

    this.currentUser = sessionStorage.getItem("currentUser");
    this.currentUserAccount = sessionStorage.getItem("currentUserAccount");
    this.oothService.getLoggedInUserName
      .subscribe(dname => {
        this.currentUser = dname;
        console.log("this.oothService.getLoggedInName: " + this.oothService.getLoggedInName);

      });
    // this.oothService.getLoggedInAccount
    //   .subscribe(account => {
    //     this.currentUserAccount = account;
    //     console.log("account: " + this.currentUser);
    //     // let balanceSession = sessionStorage.getItem('tokenBalance');
    //     // if (balanceSession) {
    //     //   this.tokenBalance = Number.parseFloat(balanceSession);
    //     //   console.log("session balance=" + balanceSession)
    //     // }
    //     // else {
    //     //   this.oothService.getTokenBalance(this.currentUserAccount)
    //     //     .then(balance => {
    //     //       console.log("balance=" + balance)
    //     //       this.tokenBalance = balance;
    //     //     });
    //     // }
    //   });
    // this.oothService.getAccountBalance
    //   .subscribe(balance => {
    //     console.log("new balance=" + balance)
    //     this.tokenBalance = balance;
    //   });

    this.http.get('/assets/language.json')
      .subscribe(data => {
        this.language = data.json();
        this.language.forEach(element => {
          console.log(element)
          if(element.Short == "cn"){
            this.selectedLanguage = element.Id;
            this.selectedFlag = element.src;
            console.log(this.selectedFlag)
          }
        });
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
    this.selectedFlag = this.language.find(n => n.Id == newValue).src;
  }
  // getTokenBalance() {
  //   console.log("in getTokenBalance()")
  //   this.oothService.getTokenBalance(this.currentUserAccount).then(balance => this.tokenBalance = balance);
  // }
  ngOnInit() {
    // this.languages = [
    //   {
    //     id: 'basic1',
    //     text: 'Basic 1'
    //   },
    //   {
    //     id: 'basic2',
    //     disabled: true,
    //     text: 'Basic 2'
    //   },
    //   {
    //     id: 'basic3',
    //     text: 'Basic 3'
    //   },
    //   {
    //     id: 'basic4',
    //     text: 'Basic 4'
    //   }
    // ];
  }
private loadCountries(locale: string): void {
    const iso3166 = getNames(locale);

    this.myCountries = [];
    // console.log(iso3166)
    for (const key of Object.keys(iso3166)) {
      
      this.myCountries.push({ display: iso3166[key], value: key.toLowerCase() });
    }
    // sort
    this.myCountries.sort((a: any, b: any) => a.display.localeCompare(b.display));
  }

  public change(newValue: string): void {
    this.iso3166Alpha2 = newValue;
    this.iso3166Alpha2Change.emit(newValue);
  }

  ngAfterViewChecked() {
    if (this.iso3166Alpha2) {
      this.iso3166Alpha2 = this.iso3166Alpha2.toLowerCase();
    }
    this.cdRef.detectChanges(); // avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }
}
