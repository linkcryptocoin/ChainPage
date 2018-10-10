import { Component, OnInit, Input } from '@angular/core';
import { OothService, MongoService } from '../_services/index';
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
import { Title } from '@angular/platform-browser';
import { getLocaleDateFormat } from '@angular/common';
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
  comments: number=0;
  constructor(
    private route: ActivatedRoute, private oothService: OothService,
    private router: Router, private globals: Globals, private mongoService: MongoService,
    private toasterService: ToasterService, private titleService: Title
  ) {
    this.titleService.setTitle("ChainPost");
    //reward user for visiting post page
    this.oothService.onUserAction(this.globals.ChainpostAppId, this.globals.action.login);

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.model.submitBy = this.currentUser.email;
    }

    //get query param
    this.page = 1;
    this.maxSize = 10;
    this.pageSize = 20;
    this.subscription = this.route.queryParams.subscribe(params => {
      //console.log(params['cat']);
      this.catParam = params['postcat'];
      this.subcatPram = params['subcat'];
      console.log(this.catParam);
      // load listings from BigChainDB
      // this.getAllTransactionsByAsset(this.catParam);
      // load listings from MongoDB
      if (this.catParam) {
        // console.log("here")
        this.subscription = this.mongoService.GetListingsByCat(this.catParam, this.globals.ChainpostAppId)
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
        this.subscription = this.mongoService.GetListingsBySubcat(this.subcatPram, this.globals.ChainpostAppId)
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
        this.subscription = this.mongoService.GetListings(this.globals.ChainpostAppId)
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
    // console.log(JSON.stringify(this.model));
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
      let postDate = new Date(this.Posts[j].postedTime);
      this.listings[j] = {
        _id: this.Posts[j]._id,
        Title: this.Posts[j].Title,
        Channel: this.Posts[j].Channel,
        postedBy: this.Posts[j].postedBy,
        likes: this.votes[j].likes,
        dislikes: this.votes[j].dislikes,
        viewCount: this.Posts[j].viewCount == null || this.Posts[j].viewCount == undefined? 0:  this.Posts[j].viewCount,
        postedTime: this.Posts[j].postedTime,
        comments:this.Posts[j].comments.length,
        showPostTime: postDate.toLocaleDateString()
      };
    }
    //order post in posted time - descending order
    this.listings.sort((obj1, obj2) => {
      if (obj1.postedTime > obj2.postedTime) {
        return -1;
      }
      else if (obj1.postedTime < obj2.postedTime) {
        return 1;
      }
      else{
        return 0;
      }
    });
    this.PostsPage = this.listings.slice(0, this.pageSize);
    // console.log("PostPage : " + this.listings);
  }

  Search(searchTxt: string) {
    // console.log("Search text: " + searchTxt);
    // this.catParam = undefined;
    if (searchTxt) {
      this.mongoService.searchListings(searchTxt, this.globals.ChainpostAppId)
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
      this.subscription = this.mongoService.GetListings(this.globals.ChainpostAppId)
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

    this.subscription = this.mongoService.deleteListing(id, this.globals.ChainpostAppId)
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
    this.mongoService.incrementViewCount(id, this.globals.ChainpostAppId)
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
