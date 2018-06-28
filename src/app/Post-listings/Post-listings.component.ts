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
import { error, element } from 'protractor';
import { environment } from 'environments/environment.prod';
@Component({
  moduleId: module.id.toString(),
  templateUrl: './Post-listings.component.html',
  styleUrls: ['./Post-listings.component.css']
})
export class PostListingsComponent implements OnInit {
  @Input() catId = 0;
  private subscription: ISubscription;
  currentUser: User;
  model: any = {};

  votes: any[] = [];
  Posts: any[] = [];
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
  PostsPage: any[] = [];
  listings: any[] = [];
  likes: number = 0;
  dislikes: number = 0;
  numoflikes: number = 0;
  numofdislikes: number = 0;
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

    //get query param
    this.page = 1;
    this.maxSize = 10;
    this.pageSize = 5;
    this.subscription = this.route.queryParams.subscribe(params => {
      //console.log(params['cat']);
      this.catParam = params['cat'];
      this.subcatPram = params['subcat'];
      console.log(this.catParam);
      // load listings from BigChainDB
      // this.getAllTransactionsByAsset(this.catParam);
      // load listings from MongoDB
      if (this.catParam) {
        // console.log("here")
        this.subscription = this.mongoService.GetListingsByCat(this.catParam)
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
        this.subscription = this.mongoService.GetListingsBySubcat(this.subcatPram)
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
        this.subscription = this.mongoService.GetListings(environment.ChainpostAppId)
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

  private showListings(response: Response) {
    this.Posts = response.json();


    // console.log(this.claims[1].businessName + " = " + this.getLikeCount(this.claims[1]))
    this.totalItems = this.Posts.length;
    this.model = this.Posts;
     console.log( JSON.stringify(this.model));
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
    for (var j = 0; j < this.Posts.length; j++) {
      //console.log(this.Posts.length);
      this.listings[j] = {
        _id: this.Posts[j]._id,
        Title: this.Posts[j].Title,
  Channel: this.Posts[j].Channel,
  postedBy: this.Posts[j].postedBy,
  likes: this.votes[j].likes,
  dislikes: this.votes[j].dislikes
      };
    }
    this.PostsPage = this.listings.slice(0, this.pageSize);
    console.log("PostPage : " + this.listings);
  }

  Search(searchTxt: string) {
    // console.log("Search text: " + searchTxt);
    // this.catParam = undefined;
    if (searchTxt) {
      this.mongoService.searchListings(searchTxt, environment.ChainpostAppId)
        .subscribe(response => {
          // console.log(response);
          this.Posts = response.json();
          this.totalItems = this.Posts.length;
          // console.log(this.Posts)
          this.model = this.Posts;
          // console.log( JSON.stringify(this.model));

          for (var i = 0; i < this.model.length; i++) {
            this.numoflikes = 0;
            this.numofdislikes = 0;

            this.model[i].votes.forEach(element => {
              console.log(element.vote);
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

          //  console.log("Posts length: " + this.Posts.length)
          this.listings = [];
          //  console.log(this.listings);
          for (var j = 0; j < this.Posts.length; j++) {
            //console.log(thi);
            this.listings[j] = {
              _id: this.Posts[j]._id,
              Title: this.Posts[j].Title,
        Channel: this.Posts[j].Channel,
        postedBy: this.Posts[j].postedBy,
        likes: this.votes[j].likes,
        dislikes: this.votes[j].dislikes
            };
          }
          console.log(this.listings);
          this.PostsPage = this.listings.slice(0, this.pageSize);
          //console.log("votes:"+JSON.stringify(this.votes));
          //console.log("listings:"+JSON.stringify(this.listings));
        })
    }
    else {
      // console.log("else");
      this.subscription = this.mongoService.GetListings(environment.ChainpostAppId)
        .subscribe(response => {
          if (response.status == 200) {
            // console.log(response.json());
            this.Posts = response.json();
            this.totalItems = this.Posts.length;
            this.model = this.Posts;
            // console.log( JSON.stringify(this.model));

            for (var i = 0; i < this.model.length; i++) {
              this.numoflikes = 0;
              this.numofdislikes = 0;

              this.model[i].votes.forEach(element => {
                console.log(element.vote);
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
            for (var j = 0; j < this.Posts.length; j++) {
              //console.log(thi);
              this.listings[j] = {
                _id: this.Posts[j]._id,
                Title: this.Posts[j].Title,
          Channel: this.Posts[j].Channel,
          postedBy: this.Posts[j].postedBy,
          likes: this.votes[j].likes,
          dislikes: this.votes[j].dislikes
              };
            }
            this.PostsPage = this.listings.slice(0, this.pageSize);
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
    console.log("this.pageSize * (pageNum - 1)" + this.pageSize * (pageNum - 1))
    console.log("this.pageSize * " + this.pageSize * (pageNum - 1) + this.pageSize)


    this.PostsPage = this.listings.slice(this.pageSize * (pageNum - 1), this.pageSize * (pageNum - 1) + this.pageSize)


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
  // private getAllTransactionsByAsset(search: string) {
  //   //clear Posts first
  //   this.Posts = [];
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
  //               this.Posts.push(claim);
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
  //                 this.Posts.push(claim);
  //               }
  //             }
  //             else {
  //               // console.log("get all");
  //               this.Posts.push(claim);
  //             }
  //           }
  //         });
  //         console.log(alasql("SELECT a.data.postedTime FROM ? AS a LEFT JOIN ? AS b ON a.data.id = b.data.id AND a.data.postedTime < b.data.postedTime Where b.data.id IS null", [this.Posts, this.Posts]));
  //         // debugger;
  //         this.Posts = alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.data.id = b.data.id AND a.data.postedTime < b.data.postedTime Where b.data.id IS null", [this.Posts, this.Posts]);
  //         this.totalItems = this.Posts.length;
  //         // console.log(this.totalItems);
  //         // sort
  //         this.Posts.sort((claim1, claim2) => {
  //           // console.log(claim1);
  //           if (claim1.data.businessName.toLowerCase() > claim2.data.businessName.toLowerCase()) {
  //             return 1;
  //           }
  //           if (claim1.data.businessName.toLowerCase() < claim2.data.businessName.toLowerCase()) {
  //             return -1;
  //           }
  //           return 0;
  //         });
  //         this.PostsPage = this.Posts.slice(0, this.pageSize);
  //         console.log(this.PostsPage);
  //       },
  //       error => {
  //         console.log(error.status);
  //       }

  //     );
  // }
  // private getAllTransactionsByMeta(search: string) {
  //   //clear Posts first
  //   this.Posts = [];
  //   this.subscription = this.bigchaindbService.getAllTransactionsByMeta(this.globals.chainFormName)
  //     .subscribe(data => {
  //       //let returnData = JSON.stringify(data);
  //       JSON.parse(JSON.stringify(data)).forEach(element => {
  //         //console.log(element.id)
  //         this.getTransactionsById(element.id, search);
  //         //let claim = element.data;
  //         // claim.id = element.id;
  //         //this.Posts.push(claim);
  //       });
  //       //this.Posts == returnData.data;
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
  //           this.Posts.push(claim);
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
  //             this.Posts.push(claim);
  //           }
  //         }
  //         else {
  //           // console.log("get all");
  //           this.Posts.push(claim);
  //         }
  //       }
  //       this.totalItems = this.Posts.length;
  //       console.log(this.totalItems);
  //       // sort
  //       this.Posts.sort((claim1, claim2) => {
  //         if (claim1.businessName.toLowerCase() > claim2.businessName.toLowerCase()) {
  //           return 1;
  //         }
  //         if (claim1.businessName.toLowerCase() < claim2.businessName.toLowerCase()) {
  //           return -1;
  //         }
  //         return 0;
  //       });
  //       this.PostsPage = this.Posts.slice(0, this.pageSize);
  //       //console.log(this.PostsPage)
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


  Remove_Listing(id) {

    // setTimeout(() =>
    // {
    // this.subscription = this.route.queryParams.subscribe(params => {
    //console.log(params['cat']);
    // this.IDparam = params['id2Delete'];

    console.log("----ID Param Value---------" + id);

    this.subscription = this.mongoService.deleteListing(id, environment.ChainpostAppId)
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


}
