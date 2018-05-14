import { Component, OnInit } from '@angular/core';
import { Claim, User } from '../_models/index'
import { UserService, AlertService, BigchanDbService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
//import { driver} from '../../../node_modules/bigchaindb-driver';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../globals'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit {

  currentUser: string;
  model: any = {};
  claims: Claim[] = [];
  submitted = false;
  categories: any[] = [];
  subcategories: any[] = [];
  countries: any[] = [];
  states: any[] = [];
  provinces: any[] = [];
  state_province: any[] = [];
  claimId: string;
  isUpdate: boolean = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private translate: TranslateService,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals,
    private alertService: AlertService, private toasterService: ToasterService,
    private http: Http
  ) {
    this.currentUser = sessionStorage.getItem('currentUser');
    this.model.submitBy = this.currentUser;
    this.route.queryParams.subscribe(params => {
      console.log(params['id']);
      this.claimId = params['id'];
      if (this.claimId) {
        this.model = this.getClaim(this.claimId);
        this.isUpdate = true;
      }
    });
    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);
        
      });
      
    this.http.get('/assets/country.json')
      .subscribe(data => {
        this.countries = data.json();
        //console.log(data);
      });
  }
  MainCategoryDropDownChanged(newValue: string) {
    //console.log(newValue);
    this.http.get('/assets/subCat.json')
      .subscribe(data => {
        this.subcategories = data.json().filter((item)=> item.Category == newValue);

        
        //console.log(newValue);
      });

    
  }
   onChange(newValue: string) {
    if (newValue.toLowerCase() == "usa") {
      console.log(newValue);
      this.http.get('/assets/us_states.json')
        .subscribe(data => {
          this.states = data.json();
          this.state_province = this.states;
          //console.log(data);
         
        });
    }
    else if (newValue.toLowerCase() == "canada") {
      console.log(newValue);
      this.http.get('/assets/canada_provinces.json')
        .subscribe(data => {
          this.provinces = data.json();
          this.state_province = this.provinces;
          //console.log(data);
        });
    }
  }
  async onSubmit() {
    this.submitted = true;
    // set the upload time stamp
    // console.log("id = " + this.model.id);
    if (this.model.id === undefined) {
      this.model.id = "NA";
    }
    this.model.postedTime = Date.now();
    // console.log(JSON.stringify(this.model));


 

    await this.bigchaindbService.createTransaction(this.model, this.globals.chainFormName)
      .then(
        data => {
          console.log(data);
          this.toasterService.pop('success', 'Submit successful');
          this.router.navigate(['/home']);
        },
        error => {
          this.toasterService.pop('error', 'Submit failed');
          console.log(error);
          return error;
        }
      );
    // console.log(result);
    // this.alertService.success('Submit successful', true);
    // this.toasterService.pop('success', 'Submit successful');
    // this.router.navigate(['/home']);

    // this.claimService.create(this.model)
    //   .subscribe(
    //     data => {
    //       this.alertService.success('Submit successful', true);
    //       this.router.navigate(['/home']);
    //       //this.loadAllClaims();
    //     },
    //     error => {
    //       this.alertService.error(error);
    //       //this.loading = false;
    //     });
  }

  getClaim(id: string) {
    this.bigchaindbService.getTransactionsById(id)
      .subscribe(data => {
        let claimData = JSON.parse(JSON.stringify(data));
        this.model = claimData.asset.data;
        if (this.model.id === "NA") {
          this.model.id = claimData.id;
        }
        console.log(this.model);
        this.onChange(this.model.country);
      });
  }
  // deleteClaim(id: number) {
  //   this.claimService.delete(id);
  // }
  // editClaim(id: number) {
  //   this.claimService.getById(id).subscribe(claim => { this.model = claim });;
  //   //console.log(this.model);
  // }
  approveClaim(id: number) {
    alert("approved");
  }
  // private loadAllClaims() {
  //   this.claimService.getAll().subscribe(claims => { this.claims = claims; });
  // }
  isAuthor(user: string): boolean {
    //console.log(this.currentUser.username == user);
    return this.currentUser == user;
  }
  countryDropDownChanged(value: any) {
    if (value == "2") {
      this.state_province = this.provinces;
    }
    else {
      this.state_province = this.states;
    }
  }
  test() {
    this.model = new Claim("NA", "John", "John Business", "123 abc st.", "DC", "DC", "20001",
      "USA", "test@test.com", "123-123-1234", "http://test.com", "Baby", "DC", "9-5",
      "1000","Furniture.", this.globals.chainFormName, this.currentUser, Date.now());
  }
  ngOnInit() {
    // this.loadAllClaims();
  }

}
