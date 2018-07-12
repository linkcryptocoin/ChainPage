import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { UserService, BigchanDbService, AlertService, OothService, VoteService, MongoService } from '../_services/index';
import { Globals } from "../globals";
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { ISubscription } from "rxjs/Subscription";
import * as alaSQLSpace from 'alasql';
import { error } from 'util';
import { Comment } from '../_models/comment';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
@Component({
  moduleId: module.id.toString(),
  selector: 'app-post-detail',
  templateUrl: './Post-detail.component.html',
  styleUrls: ['./Post-detail.component.css']
})
export class PostDetailsComponent implements OnInit {
  private subscription: ISubscription;
  private isAuthor: boolean = false;
  private reactions: string[] = ['like', 'dislike']
  currentUser: string = undefined;
  currentUserEmail: string = undefined;
  PostId: string;
  country: string;
  category: string;
  model: any = {};
  submitted: boolean = false;
  comments: any[] = [];
  totalItems: number;
  page: number;
  previousPage: any;
  pageSize: number;
  maxSize: number;
  commentsPage: any[] = [];
  ownComment: any;
  ownComments: any[] = [];
  likes: number = 0;
  dislikes: number = 0;
  alreadyLiked: boolean = false;
  alreadyDisliked: boolean = false;
  ownVote: any;
  private account: string;
  private userId: string;
  private tokenBalance: number;
  constructor(private http: Http, private route: ActivatedRoute, private globals: Globals, private oothService: OothService,
    private bigchaindbService: BigchanDbService, private toasterService: ToasterService,
    private bigchainService: BigchanDbService, private router: Router, private voteService: VoteService
    , private mongoService: MongoService) {
    this.account = sessionStorage.getItem("currentUserAccount");
    this.page = 1;
    this.maxSize = 5;
    this.pageSize = 5;
    this.currentUser = sessionStorage.getItem("currentUser");
    this.currentUserEmail = sessionStorage.getItem("currentUserEmail");
    this.oothService.getTokenBalance(this.account)
      .then(balance => {
        console.log("balance=" + balance)
        this.tokenBalance = balance;
      });
    this.oothService.getLoggedInName
      .subscribe(name => {
        if (name === "") {
          this.currentUser = undefined;
        }
        else {
          this.currentUser = name;
        }
      });
    //get query param
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      this.PostId = params['id'];
      // this.country = params['cid'];
      // this.category = params['catid'];
      // this.getClaimDetails(this.PostId);
      this.getDetails();
    });
  }
  private getDetails() {
    // console.log(this.PostId)
    //reset counts
    this.likes = 0;
    this.dislikes = 0;
    this.comments = [];
    this.ownComment = "";
    this.mongoService.GetListing(this.PostId, this.globals.ChainpostAppId)
      .subscribe(response => {
        if (response.status == 200) {
          // console.log(response);
          this.model = response.json();
          //check if current user is the author of the listing
          console.log("current user: " + this.currentUser + " author: " + this.model.postedBy)
          if(this.currentUser == this.model.postedBy || this.currentUserEmail == this.model.postedBy){
            this.isAuthor = true;
          }
          //retrieve comments
          // console.log(this.model.comments)
          this.model.comments.forEach(element => {
            if (element.postedBy == this.currentUserEmail || element.postedBy == this.currentUser) {
              this.ownComment = element;
              // console.log("ownComment: " + this.ownComment)
            }
            else {
              // console.log(element)
              this.comments.push(element);
            }
          });
          this.commentsPage = this.comments.slice(0, this.pageSize);
          // console.log("comments: " + this.commentsPage);
          //retrieve votes
          this.model.votes.forEach(element => {
            // get the current user's vote
            if (element.postedBy == this.currentUserEmail || element.postedBy == this.currentUser) {
              this.ownVote = element;
              if (element.vote == "like") {
                this.alreadyLiked = true;
                this.alreadyDisliked = false;
              }
              else if (element.vote == "dislike") {
                this.alreadyDisliked = true;
                this.alreadyLiked = false;
              }
              else {
                this.alreadyLiked = false;
                this.alreadyDisliked = false;
              }
            }
            // get vote counts
            if (element.vote == "like") {
              this.likes++;
            }
            else if (element.vote == "dislike") {
              this.dislikes++;
            }
          });
        }
        else {
          this.toasterService.pop("error", response.statusText);
        }
      });
  }

  loadPage(pageNum: number) {
    if (pageNum !== this.previousPage) {
      this.previousPage = pageNum;
      this.loadData(pageNum);
    }
  }
  loadData(pageNum: number) {
    this.commentsPage = this.comments.slice(this.pageSize * (pageNum - 1), this.pageSize * (pageNum - 1) + this.pageSize)
    console.log(this.commentsPage);
  }
  async onSubmit(commentText: string) {
    // console.log("onSubmit: " + this.PostId)
    if (sessionStorage.getItem("oothtoken") != undefined && sessionStorage.getItem("oothtoken").toString().trim() != "") {
      // console.log(this.oothService.getUser());
      // console.log("calling onSubmit()");
      // console.log(sessionStorage.getItem("oothtoken"));
      // this.VerifyToken();
      let user = await this.oothService.getUser();
      // console.log(user.local.email);
      // add new comment
      if (!this.ownComment) {
        // if (this.tokenBalance >= this.globals.tokenDeductAmmount_ChainpageComment) {
          let data = {
            _id: this.PostId,
            appId: this.globals.ChainpostAppId,
            comment: {
              comment: commentText,
              postedBy: this.currentUser,//user.local.email,
              postedTime: Date.now()
            }
          };
          // console.log((JSON.stringify(data)));
          this.mongoService.addComment(data)
            .subscribe(response => {
              if (response.status == 200) {
                this.toasterService.pop('success', 'Comment submitted successfully');
                this.submitted = true;
                console.log("account: " + this.account);
                //deduct token
                if (!this.ownComment) {
                  console.log("reward new comment token from " + sessionStorage.getItem("currentUserId"));
                  this.oothService.onUserAction(this.globals.ChainpostAppId, this.globals.action.comment);
                  // this.oothService.deductToken(sessionStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageComment);
                }
                //reload comments
                this.getDetails();
                return true;
              }
              else {
                this.toasterService.pop("error", response.statusText);
              }
            })
        // }
        // else {
        //   this.toasterService.pop("error", "You don't have enough tokens");
        // }
      }
      // update comment
      else {
        let data = {
          _id: this.PostId,
          appId: this.globals.ChainpostAppId,
          comment: {
            _id: this.ownComment._id,
            comment: commentText,
            postedTime: Date.now()
          }
        };
        this.mongoService.updateComment(data)
          .subscribe(response => {
            if (response.status == 200) {
              this.toasterService.pop('success', 'Comment submitted successfully');
              this.submitted = true;
              // console.log("account: " + this.account);
              //deduct token
              // if (!this.ownComment) {
              //   console.log("deduct new comment token from " + this.account);
              //   this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageComment);
              // }
              //reload comments
              this.getDetails();
              return true;
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      // console.log(result);
    }
    else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return false;
    }
  }
  thumbsUp() {
    if (!this.alreadyDisliked) {
      if (this.alreadyLiked) {
        // console.log("already liked: " + this.alreadyLiked);
        let data = {
          _id: this.PostId,
          appId: this.globals.ChainpostAppId,
          vote: {
            _id: this.ownVote._id
          }
        };
        this.mongoService.deleteVote(data)
          .subscribe(response => {
            if (response.status == 200) {
              this.toasterService.pop('success', 'Vote deleted successfully');
              this.submitted = true;
              // this.likes--;
              // console.log("user id: " + sessionStorage.getItem("currentUserId"));
              //deduct token
              // this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageUpVote);
              //reload votes
              this.getDetails();
              this.alreadyLiked = !this.alreadyLiked;
              return true;
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else {
        console.log("token balance: " + this.tokenBalance)
        // if (this.tokenBalance >= this.globals.tokenDeductAmmount_ChainpageUpVote) {
          // console.log("not yet liked: " + this.alreadyLiked)
          let data = {
            _id: this.PostId,
            appId: this.globals.ChainpostAppId,
            vote: {
              vote: this.reactions[0],  //like
              postedBy: this.currentUser, //this.currentUserEmail,
              postedTime: Date.now()
            }
          };
          this.mongoService.addVote(data)
            .subscribe(response => {
              if (response.status == 200) {
                this.toasterService.pop('success', 'Vote submitted successfully');
                this.submitted = true;
                // this.likes++;
                console.log("user id: " + sessionStorage.getItem("currentUserId"));
                //deduct token
                this.oothService.onUserAction(this.globals.ChainpostAppId, this.globals.action.like)
                //this.oothService.deductToken(sessionStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageUpVote);
                //reload votes
                this.getDetails();
                this.alreadyLiked = !this.alreadyLiked;
                return true;
              }
              else {
                this.toasterService.pop("error", response.statusText);
              }
            })
        // }
        // else {
        //   this.toasterService.pop("error", "You don't have enough tokens");
        // }
      }

    }
  }
  thumbsDown() {
    // console.log(this.alreadyDisliked);
    if (!this.alreadyLiked) {
      if (this.alreadyDisliked) {
        // console.log(this.alreadyDisliked);
        let data = {
          _id: this.PostId,
          appId: this.globals.ChainpostAppId,
          vote: {
            _id: this.ownVote._id
          }
        };
        this.mongoService.deleteVote(data)
          .subscribe(response => {
            if (response.status == 200) {
              this.toasterService.pop('success', 'Vote deleted successfully');
              this.submitted = true;
              // this.likes--;
              // console.log("account: " + this.account);
              //deduct token
              // this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageDownVote);
              //reload votes
              this.getDetails();
              this.alreadyDisliked = !this.alreadyDisliked;
              return true;
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else {
        // if (this.tokenBalance >= this.globals.tokenDeductAmmount_ChainpageDownVote) {
          // console.log(this.alreadyDisliked);
          let data = {
            _id: this.PostId,
            appId: this.globals.ChainpostAppId,
            vote: {
              vote: this.reactions[1],  //dislike
              postedBy: this.currentUser, //this.currentUserEmail,
              postedTime: Date.now()
            }
          };
          this.mongoService.addVote(data)
            .subscribe(response => {
              if (response.status == 200) {
                this.toasterService.pop('success', 'Vote submitted successfully');
                this.submitted = true;
                // this.likes++;
                // console.log("account: " + this.account);
                //deduct token
                this.oothService.onUserAction(this.globals.ChainpostAppId, this.globals.action.dislike)
                //this.oothService.deductToken(sessionStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageDownVote);
                //reload votes
                this.getDetails();
                this.alreadyDisliked = !this.alreadyDisliked;
                return true;
              }
              else {
                this.toasterService.pop("error", response.statusText);
              }
            })
        // }
        // else {
        //   this.toasterService.pop("error", "You don't have enough tokens");
        // }
      }

      // console.log(this.alreadyDisliked);
    }
  }
  
  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
  ngOnInit() {
  }

}
