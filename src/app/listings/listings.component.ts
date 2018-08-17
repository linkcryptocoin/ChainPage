import { Component, OnInit, Input } from '@angular/core';
import { UserService, AlertService, SwarmService, MongoService } from '../_services/index';
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
import { error, element } from 'protractor';
import { environment } from 'environments/environment';
import { isNullOrUndefined } from 'util';
import { Title } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
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
  imgUrl: String;
  votes: any[] = [];
  claims: any[] = [];
  submitted = false;
  categories: any[] = [];
  countries: any[] = [];
  catParam = "";
  subcatPram = "";
  IDparam = "";
  totalItems: number;
  page: number;
  previousPage: any;
  pageSize: number;
  maxSize: number;
  claimsPage: any[] = [];
  listings: any[] = [];
  likes: number = 0;
  dislikes: number = 0;
  numoflikes: number = 0;
  numofdislikes: number = 0;
  constructor(
    private route: ActivatedRoute, private swarmService: SwarmService,
    private router: Router, private globals: Globals, private mongoService: MongoService,
    private userService: UserService, private toasterService: ToasterService,
    private alertService: AlertService, private titleService: Title,
    private http: Http, private translate: TranslateService
  ) {
    //set title
    this.titleService.setTitle("ChainPage");
    // translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   console.log("lang changed")
    //   translate.get('page_title').subscribe((res: string) => {
    //     titleService.setTitle(res);
    //   });
    // });
    
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
    this.pageSize = 20;
    this.subscription = this.route.queryParams.subscribe(params => {
      //console.log(params['cat']);
      this.catParam = params['cat'];
      this.subcatPram = params['subcat'];
      // console.log(this.catParam);
      // load listings from BigChainDB
      // this.getAllTransactionsByAsset(this.catParam);
      // load listings from MongoDB
      if (this.catParam) {
        // console.log("here")
        this.subscription = this.mongoService.GetListingsByCat(this.catParam, this.globals.ChainpageAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.showListings(response);
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else if (this.subcatPram) {
        this.subscription = this.mongoService.GetListingsBySubcat(this.subcatPram, this.globals.ChainpageAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.showListings(response);
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else {
        // console.log("else");
        this.subscription = this.mongoService.GetListings(this.globals.ChainpageAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.showListings(response);
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          });
      }
    });
  }

  public getLikeCount(claim: any): number {
    let likeCount = 0;
    claim.votes.forEach(element => {
      // get like counts
      if (element.vote === "like") {
        likeCount++;
      }
    });
    return likeCount;
  }
  private getBusinessName(name?: string): any {
    return (name != null && name != undefined) ? name : "ZZZZZ";
  }
  private showListings(response: Response) {
    this.claims = response.json();
    //sort by business name first
    // this.claims.sort((obj1, obj2) => {
    //   if (this.getBusinessName(obj1.businessName) < this.getBusinessName(obj2.businessName)) {
    //     return -1;
    //   }
    //   if (this.getBusinessName(obj1.businessName) > this.getBusinessName(obj2.businessName)) {
    //     return 1;
    //   }
    //   return 0;
    // });
    //then sort by number of likes
    this.claims.sort((obj1, obj2) => {
      if (this.getLikeCount(obj2) < this.getLikeCount(obj1)) {
        return -1;
      }
      else if (this.getLikeCount(obj2) > this.getLikeCount(obj1)) {
        return 1;
      }
      else {
        if (this.getBusinessName(obj1.businessName) < this.getBusinessName(obj2.businessName)) {
          return -1;
        }
        else if (this.getBusinessName(obj1.businessName) > this.getBusinessName(obj2.businessName)) {
          return 1;
        }
        else {
          return 0;
        }
      }
    });
    // console.log(this.claims[1].businessName + " = " + this.getLikeCount(this.claims[1]))
    this.totalItems = this.claims.length;
    this.model = this.claims;
    // console.log( JSON.stringify(this.model));
    for (var i = 0; i < this.model.length; i++) {
      this.numoflikes = 0;
      this.numofdislikes = 0;
      this.model[i].votes.forEach(element => {
        // console.log(element.vote);
        // get vote counts
        if (element.vote === "like") {
          this.numoflikes++;
        }
        else if (element.vote === "dislike") {
          this.numofdislikes++;
        }
      });
      this.votes[i] = {
        _id: this.model[i]._id,
        likes: this.numoflikes,
        dislikes: this.numofdislikes
      };
    }
    this.listings = [];
    for (var j = 0; j < this.claims.length; j++) {
      console.log(this.claims[j].pictures[0]);
      this.listings[j] = {
        imgUrl: isNullOrUndefined(this.claims[j].pictures[0]) || this.claims[j].pictures[0] == "" ?
                  "../../assets/linkGearGGold.png" : this.swarmService.getFileUrls(new Array(this.claims[j].pictures[0])),
        _id: this.claims[j]._id,
        businessMainCategory: this.claims[j].businessMainCategory,
        businessName: this.claims[j].businessName,
        service: this.claims[j].service,
        phone: this.claims[j].phone,
        likes: this.votes[j].likes,
        dislikes: this.votes[j].dislikes,
        viewCount: this.claims[j].viewCount == null || this.claims[j].viewCount == undefined? 0:  this.claims[j].viewCount,
        comments: this.claims[j].comments.length
      };
    }
    this.claimsPage = this.listings.slice(0, this.pageSize);
    // console.log(this.claimsPage)
  }

  Search(searchTxt: string) {
    // console.log("Search text: " + searchTxt);
    // this.catParam = undefined;
    if (searchTxt) {
      this.mongoService.searchListings(searchTxt, this.globals.ChainpageAppId)
        .subscribe(response => {
          // console.log(response);
          this.claims = response.json();
          this.totalItems = this.claims.length;
          // console.log(this.claims)
          this.model = this.claims;
          // console.log( JSON.stringify(this.model));

          for (var i = 0; i < this.model.length; i++) {
            this.numoflikes = 0;
            this.numofdislikes = 0;

            this.model[i].votes.forEach(element => {
              // console.log(element.vote);
              // get vote counts
              if (element.vote === "like") {
                this.numoflikes++;
              } else if (element.vote === "dislike") {
                this.numofdislikes++;
              }
            });

            this.votes[i] = {
              _id: this.model[i]._id,
              likes: this.numoflikes,
              dislikes: this.numofdislikes
            };
          }

          //  console.log("claims length: " + this.claims.length)
          this.listings = [];
          //  console.log(this.listings);
          for (var j = 0; j < this.claims.length; j++) {
            //console.log(thi);
            this.listings[j] = {
              _id: this.claims[j]._id,
              businessMainCategory: this.claims[j].businessMainCategory,
              businessName: this.claims[j].businessName,
              service: this.claims[j].service,
              phone: this.claims[j].phone,
              likes: this.votes[j].likes,
              dislikes: this.votes[j].dislikes
            };
          }
          // console.log(this.listings);
          this.claimsPage = this.listings.slice(0, this.pageSize);
          //console.log("votes:"+JSON.stringify(this.votes));
          //console.log("listings:"+JSON.stringify(this.listings));
        })
    }
    else {
      // console.log("else");
      this.subscription = this.mongoService.GetListings(this.globals.ChainpageAppId)
        .subscribe(response => {
          if (response.status == 200) {
            // console.log(response.json());
            this.claims = response.json();
            this.totalItems = this.claims.length;
            this.model = this.claims;
            // console.log( JSON.stringify(this.model));

            for (var i = 0; i < this.model.length; i++) {
              this.numoflikes = 0;
              this.numofdislikes = 0;

              this.model[i].votes.forEach(element => {
                // console.log(element.vote);
                // get vote counts
                if (element.vote === "like") {
                  this.numoflikes++;
                } else if (element.vote === "dislike") {
                  this.numofdislikes++;
                }
              });

              this.votes[i] = {
                _id: this.model[i]._id,
                likes: this.numoflikes,
                dislikes: this.numofdislikes
              };
            }

            this.listings = [];
            for (var j = 0; j < this.claims.length; j++) {
              //console.log(thi);
              this.listings[j] = {
                _id: this.claims[j]._id,
                businessMainCategory: this.claims[j].businessMainCategory,
                businessName: this.claims[j].businessName,
                service: this.claims[j].service,
                phone: this.claims[j].phone,
                likes: this.votes[j].likes,
                dislikes: this.votes[j].dislikes
              };
            }
            this.claimsPage = this.listings.slice(0, this.pageSize);
            //console.log("votes:"+JSON.stringify(this.votes));
            //console.log("listings:"+JSON.stringify(this.listings));
          }
          else {
            this.toasterService.pop("error", response.statusText);
          }
        });
      //
    }
  }



  loadPage(pageNum: number) {
    if (pageNum !== this.previousPage) {
      this.previousPage = pageNum;
      this.loadData(pageNum);
    }
  }
  loadData(pageNum: number) {
    // console.log("this.pageSize * (pageNum - 1)" + this.pageSize * (pageNum - 1))
    // console.log("this.pageSize * " + this.pageSize * (pageNum - 1) + this.pageSize)


    this.claimsPage = this.listings.slice(this.pageSize * (pageNum - 1), this.pageSize * (pageNum - 1) + this.pageSize)


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
    //alert("approved");
  }
  
  ngOnInit() {

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  Remove_Listing(id) {

    // setTimeout(() => 
    // {
    // this.subscription = this.route.queryParams.subscribe(params => {
    //console.log(params['cat']);
    // this.IDparam = params['id2Delete'];

    console.log("----ID Param Value---------" + id);

    this.subscription = this.mongoService.deleteListing(id, this.globals.ChainpageAppId)
      .subscribe(response => {
        if (response.status == 200) {
          this.toasterService.pop("success", "Listing deleted")
          this.router.navigate(['/home']);
        }
        else {
          this.toasterService.pop("error", response.statusText)
        }
      });
    //await this.bigchaindbService.DeleteTransaction()

    // });
    // },
    // 1000);


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

  incrementViewCount(id) {
    this.mongoService.incrementViewCount(id, this.globals.ChainpageAppId)
      .subscribe(response => {
        if (response.status == 200) {
          // console.log(response.json());
        }
        else {
          this.toasterService.pop("error", response.statusText);
        }
      });
  }
}
