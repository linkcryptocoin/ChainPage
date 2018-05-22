import { Component, OnInit, Input } from '@angular/core';
import { UserService, AlertService, BigchanDbService, MongoService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
import { User, Claim } from '../_models/index';
import { forEach } from '@angular/router/src/utils/collection';
import { Globals } from '../globals'
import { Observable } from 'rxjs/Observable';
// import { HttpRequest } from '@angular/common/http';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import 'rxjs/add/operator/switchMap';
import { filter } from 'rxjs/operators';
import { ISubscription } from "rxjs/Subscription";
import * as alaSQLSpace from 'alasql';
import { error } from 'protractor';
@Component({
  moduleId: module.id.toString(),
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css']
})
export class ListingsComponent implements OnInit {
  @Input() catId = 0;
  private subscription: ISubscription;
  currentUser: User;
  model: any = {};
  claims: any[] = [];
  submitted = false;
  categories: any[] = [];
  countries: any[] = [];
  catParam = "";
  IDparam = "";
  totalItems: number;
  page: number;
  previousPage: any;
  pageSize: number;
  maxSize: number;
  claimsPage: any[] = [];
  likes: number = 0;
  dislikes: number = 0;
  constructor(
    private route: ActivatedRoute, private bigchaindbService: BigchanDbService,
    private router: Router, private globals: Globals, private mongoService: MongoService,
    private userService: UserService, private toasterService: ToasterService,
    private alertService: AlertService,
    private http: Http//, private voteService: VoteService
  ) {



    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.model.submitBy = this.currentUser.email;
    }
    this.subscription = this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);
      });
    this.subscription = this.http.get('/assets/country.json')
      .subscribe(data => {
        this.countries = data.json();
        //console.log(data);
      });
    //get query param
    this.page = 1;
    this.maxSize = 10;
    this.pageSize = 5;
    this.subscription = this.route.queryParams.subscribe(params => {
      //console.log(params['cat']);
      this.catParam = params['cat'];
      console.log(this.catParam);
      // load listings from BigChainDB
      // this.getAllTransactionsByAsset(this.catParam);
      // load listings from MongoDB
      if (this.catParam) {
        // console.log("here")
        this.subscription = this.mongoService.GetListingsByCat(this.catParam)
          .subscribe(response => {
            // console.log(response);
            this.claims = response.json();
            this.claimsPage = this.claims.slice(0, this.pageSize);
          })
      }
      else {
        // console.log("else");
        this.subscription = this.mongoService.GetListings()
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.claims = response.json();
              this.claimsPage = this.claims.slice(0, this.pageSize);
              console.log(this.claimsPage);
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          });
      }
    });
  }
  Search(searchTxt: string) {
    // console.log("Search text: " + searchTxt);
    this.catParam = undefined;

  }
  loadPage(pageNum: number) {
    if (pageNum !== this.previousPage) {
      this.previousPage = pageNum;
      this.loadData(pageNum);
    }
  }
  loadData(pageNum: number) {
    // console.log(this.pageSize * (pageNum - 1))
    // console.log(this.pageSize * (pageNum - 1) + this.pageSize)
    this.claimsPage = this.claims.slice(this.pageSize * (pageNum - 1), this.pageSize * (pageNum - 1) + this.pageSize)
  }
  public getCountryName(id: number): string {
    var value = "";
    this.countries.forEach(pair => {
      if (pair.ID == id) {
        value = pair.Country;
        //break;
      }
    });
    return value;
  }
  public getCategoryName(id: string): string {
    var value = "";
    this.categories.forEach(pair => {
      //console.log(pair.Country)
      if (pair.Category == id) {
        value = pair.Description;
        //break;
      }
    });
    return value;
  }
  public getCategoryId(name: string): string {
    var value = "";
    this.categories.forEach(pair => {
      //console.log(pair.Country)
      if (pair.Description == name) {
        value = pair.Category;
        //break;
      }
    });
    return value;
  }

  approveClaim(id: number) {
    alert("approved");
  }
  // private getAllTransactionsByAsset(search: string) {
  //   //clear claims first
  //   this.claims = [];
  //   let data:any = this.bigchaindbService.getAllTransactionsByAsset(this.globals.chainFormName)
  //                   .take(1);
  //   console.log(data);
  //   this.subscription = this.bigchaindbService.getAllTransactionsByAsset(this.globals.chainFormName)
  //     .subscribe(
  //       data => {
  //         //let returnData = JSON.stringify(data);
  //         // console.log(data);
  //         (JSON.parse(JSON.stringify(data))).forEach(claim => {
  //           let matchFound = false;
  //           if(claim.data.id === "NA"){
  //             claim.data.id = claim.id;
  //           }
  //           // console.log(claim.id);
  //           // console.log(claim.data.id);
  //           // search by query param
  //           if (this.catParam != undefined) {
  //             if (claim.data.businessCategory.toLowerCase() == this.catParam.toLowerCase()) {
  //               this.claims.push(claim);
  //             }
  //           }
  //           else {
  //             if (search != undefined && search != "") {
  //               // console.log("search here");
  //               Object.keys(claim.data).forEach(key => {
  //                 // console.log(claim.data[key].toString().toLowerCase().includes(search));
  //                 if (claim.data[key].toString().toLowerCase().includes(search)) {
  //                   matchFound = true;
  //                   return;
  //                 }
  //               });
  //               if (matchFound) {
  //                 this.claims.push(claim);
  //               }
  //             }
  //             else {
  //               // console.log("get all");
  //               this.claims.push(claim);
  //             }
  //           }
  //         });
  //         console.log(alasql("SELECT a.data.postedTime FROM ? AS a LEFT JOIN ? AS b ON a.data.id = b.data.id AND a.data.postedTime < b.data.postedTime Where b.data.id IS null", [this.claims, this.claims]));
  //         // debugger;
  //         this.claims = alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.data.id = b.data.id AND a.data.postedTime < b.data.postedTime Where b.data.id IS null", [this.claims, this.claims]);
  //         this.totalItems = this.claims.length;
  //         // console.log(this.totalItems);
  //         // sort               
  //         this.claims.sort((claim1, claim2) => {
  //           // console.log(claim1);
  //           if (claim1.data.businessName.toLowerCase() > claim2.data.businessName.toLowerCase()) {
  //             return 1;
  //           }
  //           if (claim1.data.businessName.toLowerCase() < claim2.data.businessName.toLowerCase()) {
  //             return -1;
  //           }
  //           return 0;
  //         });
  //         this.claimsPage = this.claims.slice(0, this.pageSize);
  //         console.log(this.claimsPage);
  //       },
  //       error => {
  //         console.log(error.status);
  //       }

  //     );
  // }
  // private getAllTransactionsByMeta(search: string) {
  //   //clear claims first
  //   this.claims = [];
  //   this.subscription = this.bigchaindbService.getAllTransactionsByMeta(this.globals.chainFormName)
  //     .subscribe(data => {
  //       //let returnData = JSON.stringify(data);                 
  //       JSON.parse(JSON.stringify(data)).forEach(element => {
  //         //console.log(element.id)
  //         this.getTransactionsById(element.id, search);
  //         //let claim = element.data;
  //         // claim.id = element.id;
  //         //this.claims.push(claim);                                   
  //       });
  //       //this.claims == returnData.data;
  //     });
  //   //console.log(result)
  // }
  // private getTransactionsById(id: string, search: string) {
  //   this.subscription = this.bigchaindbService.getTransactionsById(id)
  //     .subscribe(data => {
  //       //let returnData = JSON.stringify(data);
  //       //console.log(data);
  //       let claim = (JSON.parse(JSON.stringify(data))).asset.data;
  //       claim.id = (JSON.parse(JSON.stringify(data))).id;
  //       // console.log(search);   
  //       // debugger;
  //       let matchFound = false;
  //       // search by query param
  //       if (this.catParam != undefined) {
  //         if (claim.businessCategory.toLowerCase() == this.catParam.toLowerCase()) {
  //           this.claims.push(claim);
  //         }
  //       }
  //       else {
  //         if (search != undefined && search != "") {
  //           console.log("search here");
  //           Object.keys(claim).forEach(key => {
  //             // console.log(claim[key].toString().toLowerCase().includes(search));
  //             if (claim[key].toString().toLowerCase().includes(search)) {
  //               matchFound = true;
  //               return;
  //             }
  //           });
  //           if (matchFound) {
  //             this.claims.push(claim);
  //           }
  //         }
  //         else {
  //           // console.log("get all");
  //           this.claims.push(claim);
  //         }
  //       }
  //       this.totalItems = this.claims.length;
  //       console.log(this.totalItems);
  //       // sort               
  //       this.claims.sort((claim1, claim2) => {
  //         if (claim1.businessName.toLowerCase() > claim2.businessName.toLowerCase()) {
  //           return 1;
  //         }
  //         if (claim1.businessName.toLowerCase() < claim2.businessName.toLowerCase()) {
  //           return -1;
  //         }
  //         return 0;
  //       });
  //       this.claimsPage = this.claims.slice(0, this.pageSize);
  //       //console.log(this.claimsPage)
  //     });
  //   //console.log(result)
  // }
  // Search(searchTxt: string) {
  //   // console.log("Search text: " + searchTxt);
  //   this.catParam = undefined;
  //   this.getAllTransactionsByAsset(searchTxt.toLowerCase().trim());
  // }

  ngOnInit() {

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  Remove_Listing() {
    this.subscription = this.route.queryParams.subscribe(params => {
      //console.log(params['cat']);
      this.IDparam = params['id'];
      console.log("----ID Param Value---------" + this.IDparam);

      //await this.bigchaindbService.DeleteTransaction()
    });

  }

  // getVotes(id: string) {
  //   this.likes = 0;
  //   this.dislikes = 0;

  //   // let data: any;
  //   this.voteService.voteData.subscribe(data => {
  //     // data=data;
  //     console.log('---DATA-----' + data);
  //     // this.zone.run(() => {
  //     if (data !== undefined) {
  //       this.likes = data.likes;
  //       this.dislikes = data.dislikes;
  //       // console.log(this.alreadyDisliked);
  //     }
  //   });
  //   console.log('---DATA ID-----' + id);
  //   this.voteService.getVotes(id);
  // }


}
