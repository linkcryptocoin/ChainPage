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
@Component({
  moduleId: module.id.toString(),
  selector: 'app-claim-detail',
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {
  private subscription: ISubscription;
  private isAuthor: boolean = false;
  private reactions: string[] = ['like', 'dislike']
  currentUser: string = undefined;
  claimId: string;
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
      this.claimId = params['id'];
      // this.country = params['cid'];
      // this.category = params['catid'];
      // this.getClaimDetails(this.claimId);
      this.getDetails();
    });
  }
  private getDetails() {
    // console.log(this.claimId)
    //reset counts
    this.likes = 0;
    this.dislikes = 0;
    this.comments = [];
    this.ownComment = "";
    this.mongoService.GetListing(this.claimId)
      .subscribe(response => {
        if (response.status == 200) {
          // console.log(response);
          this.model = response.json();
          //retrieve comments
          // console.log(this.model.comments)
          this.model.comments.forEach(element => {
            if (element.postedBy == this.currentUser) {
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
            if (element.postedBy == this.currentUser) {
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
    // console.log("onSubmit: " + this.claimId)
    if (sessionStorage.getItem("oothtoken") != undefined && sessionStorage.getItem("oothtoken").toString().trim() != "") {
      // console.log(this.oothService.getUser());
      // console.log("calling onSubmit()");
      // console.log(sessionStorage.getItem("oothtoken"));
      // this.VerifyToken();
      let user = await this.oothService.getUser();
      // console.log(user.local.email);
      // add new comment
      if (!this.ownComment) {
        if (this.tokenBalance >= this.globals.tokenDeductAmmount_ChainpageComment) {
          let data = {
            _id: this.claimId,
            comment: {
              comment: commentText,
              postedBy: user.local.email,
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
                  console.log("deduct new comment token from " + sessionStorage.getItem("currentUserId"));
                  this.oothService.deductToken(sessionStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageComment);
                }
                //reload comments
                this.getDetails();
                return true;
              }
              else {
                this.toasterService.pop("error", response.statusText);
              }
            })
        }
        else {
          this.toasterService.pop("error", "You don't have enough tokens");
        }
      }
      // update comment
      else {
        let data = {
          _id: this.claimId,
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
          _id: this.claimId,
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
        if (this.tokenBalance >= this.globals.tokenDeductAmmount_ChainpageUpVote) {
          // console.log("not yet liked: " + this.alreadyLiked)
          let data = {
            _id: this.claimId,
            vote: {
              vote: this.reactions[0],  //like
              postedBy: this.currentUser,
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
                this.oothService.deductToken(sessionStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageUpVote);
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
          this.toasterService.pop("error", "You don't have enough tokens");
        }
      }
      
    }
  }
  thumbsDown() {
    // console.log(this.alreadyDisliked);
    if (!this.alreadyLiked) {
      if (this.alreadyDisliked) {
        // console.log(this.alreadyDisliked);
        let data = {
          _id: this.claimId,
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
        if (this.tokenBalance >= this.globals.tokenDeductAmmount_ChainpageDownVote) {
          // console.log(this.alreadyDisliked);
          let data = {
            _id: this.claimId,
            vote: {
              vote: this.reactions[1],  //dislike
              postedBy: this.currentUser,
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
                this.oothService.deductToken(sessionStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageDownVote);
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
          this.toasterService.pop("error", "You don't have enough tokens");
        }
      }
      
      // console.log(this.alreadyDisliked);
    }
  }
  // getClaimDetails(id: string) {
  //   this.bigchainService.getTransactionsById(id)
  //     .subscribe(
  //       // error => {
  //       //   // console.log(JSON.stringify(error));
  //       //   this.toasterService.pop('error', 'Failed to load data');
  //       // },
  //       data => {
  //         console.log(data);
  //         let claim = (JSON.parse(JSON.stringify(data))).asset.data;
  //         // use record's transaction id as the id
  //         if (claim.id === "NA") {
  //           claim.id = (JSON.parse(JSON.stringify(data))).id;
  //         }
  //         this.model = claim;
  //         if (this.currentUser == this.model.postedBy) {
  //           this.isAuthor = true;
  //           console.log(this.isAuthor);
  //         }
  //         // get comments and votes
  //         this.getComments(this.model.id);
  //         this.getVotes(this.model.id);
  //       });
  // }
  // deleteClaim(id: number) {
  //   this.claimService.delete(id);
  // }
  // editClaim(id: number) {
  //   this.claimService.getById(id).subscribe(claim => { this.model = claim });;
  //   //console.log(this.model);
  // }
  // async onSubmit(commentText: string) {
  //   if (sessionStorage.getItem("oothtoken") != undefined && sessionStorage.getItem("oothtoken").toString().trim() != "") {
  //     // console.log(this.oothService.getUser());
  //     // console.log("calling onSubmit()");
  //     // console.log(sessionStorage.getItem("oothtoken"));
  //     // this.VerifyToken();
  //     let user = await this.oothService.getUser();
  //     // console.log(user.local.email);

  //     // let data = {
  //     //   id: this.model.id,
  //     //   type: this.globals.chainPageComment,
  //     //   comment: commentText,
  //     //   postedBy: user.local.email,
  //     //   postedTime: Date.now()
  //     // };
  //     let data = new Comment(this.globals.chainPageComment, commentText,
  //       user.local.email, Date.now());
  //     // console.log((JSON.stringify(data)));
  //     var result = await this.bigchaindbService.createTransaction(JSON.parse(JSON.stringify(data)), this.globals.chainFormName)
  //       .then(
  //         (data) => {
  //           this.toasterService.pop('success', 'Comment submitted successfully');
  //           this.submitted = true;
  //           console.log("account: " + this.account);
  //           //deduct token
  //           if (!this.ownComment) {
  //             console.log("deduct new comment token from " + this.account);
  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageComment);
  //           }
  //           //reload comments
  //           this.getComments(this.model.id);
  //           return true;
  //         },
  //         (err) => {
  //           if (err.message.toLowerCase().includes("error")) {
  //             this.toasterService.pop('error', 'Failed to submit comment');
  //             return false;
  //           }
  //         }
  //       );
  //     // console.log(result);
  //   }
  //   else {
  //     this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  //     return false;
  //   }
  // }
  // getComments(id: string) {
  //   // let foundData: any[];
  //   this.comments = [];
  //   this.ownComments = [];
  //   this.ownComment = "";
  //   // console.log("in getComments()");
  //   this.subscription = this.bigchaindbService.getAllTransactionsByAsset(id)
  //     .subscribe(
  //       // error => {
  //       //   // console.log(JSON.stringify(error));
  //       //   this.toasterService.pop('error', 'Failed to load comments');
  //       // },

  //       dataset => {
  //         // let data = (JSON.parse(JSON.stringify(dataset))).data;
  //         // console.log(dataset);
  //         JSON.parse(JSON.stringify(dataset)).forEach(element => {
  //           // console.log(element.data);
  //           if (element.data.type == this.globals.chainPageComment) {
  //             if (sessionStorage.getItem("currentUser") != undefined) {
  //               if (element.data.postedBy == sessionStorage.getItem("currentUser").toString()) {
  //                 this.ownComments.push(element.data);
  //                 // console.log("push to ownComments");
  //                 // console.log(element.data);
  //               }
  //               else {
  //                 this.comments.push(element.data);
  //                 // console.log("push to comments");
  //               }
  //             }
  //             else {
  //               this.comments.push(element.data);
  //             }
  //           }
  //         });
  //         // get the latest comment for current user
  //         // console.log(this.ownComments.length);
  //         if (this.ownComments.length > 0 && this.ownComments.length <= 1) {
  //           this.ownComment = this.ownComments[0];
  //         }
  //         else if (this.ownComments.length > 1) {
  //           let max = Math.max.apply(Math, this.ownComments.map(function (o) { return o.postedTime; }));
  //           this.ownComments.forEach(comment => {
  //             // console.log(comment);
  //             if (comment.postedTime == max) {
  //               this.ownComment = comment;
  //               // console.log(this.ownComment.comment);
  //             }
  //           })
  //         }
  //         // console.log(alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.postedBy = b.postedBy AND a.postedTime < b.postedTime Where b.postedBy IS null", [this.comments,this.comments]));
  //         this.comments = alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.postedBy = b.postedBy AND a.postedTime < b.postedTime Where b.postedBy IS null", [this.comments, this.comments]);
  //         this.totalItems = this.comments.length;
  //         console.log(this.totalItems);
  //         // console.log(this.ownComments);
  //         let data = {
  //           ownComment: this.ownComment,
  //           comments: this.comments
  //         }
  //         this.commentsPage = this.comments.slice(0, this.pageSize);
  //         return data;
  //       });
  // }
  // thumbsUp() {
  //   if (!this.alreadyDisliked) {
  //     if (this.alreadyLiked) {
  //       this.likes--;
  //       this.voteService.vote(this.model.id, "neutral", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {
  //             console.log("deduct from account: " + this.account + " " + this.globals.tokenDeductAmmount_ChainpageVote + " token");
  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )

  //     }
  //     else {
  //       this.likes++;
  //       this.voteService.vote(this.model.id, "like", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {
  //             console.log("deduct from account: " + this.account + " " + this.globals.tokenDeductAmmount_ChainpageVote + " token");
  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )
  //     }

  //     this.alreadyLiked = !this.alreadyLiked;
  //   }

  // }
  // thumbsDown() {
  //   // console.log(this.alreadyDisliked);
  //   if (!this.alreadyLiked) {
  //     if (this.alreadyDisliked) {
  //       // console.log(this.alreadyDisliked);
  //       this.dislikes--;
  //       this.voteService.vote(this.model.id, "neutral", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {

  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )
  //     }
  //     else {
  //       // console.log(this.alreadyDisliked);
  //       this.dislikes++;
  //       this.voteService.vote(this.model.id, "dislike", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {

  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )
  //     }
  //     this.alreadyDisliked = !this.alreadyDisliked;
  //     // console.log(this.alreadyDisliked);
  //   }
  // }
  getVotes(id: string) {
    this.likes = 0;
    this.dislikes = 0;

    // let data: any;
    this.voteService.voteData.subscribe(data => {
      // data=data;
      // console.log(data);
      // this.zone.run(() => {
      if (data != undefined) {
        this.likes = data.likes;
        this.dislikes = data.dislikes;
        this.alreadyLiked = data.alreadyLiked;
        this.alreadyDisliked = data.alreadyDisliked;
        // console.log(this.alreadyDisliked);
      }
      //     if (data != undefined) {
      //   // console.log(data.votes)
      //   if (data.votes && data.votes.length > 0) {
      //     this.likes = (alasql("SELECT count(*) as cnt FROM ? Where vote = 'like'", [data.votes]))[0].cnt;
      //     this.dislikes = (alasql("SELECT count(*) as cnt FROM ? Where vote = 'dislike'", [data.votes]))[0].cnt;
      //     // console.log("like = " + this.likes + " dislike = " + this.dislikes);
      //   }
      //   // console.log((alasql("SELECT count(*) as cnt FROM ? Where vote = 'like'", [data.votes]))[0].cnt)
      //   if (data.ownVote) {
      //     if (data.ownVote.vote == "like") {
      //       this.alreadyLiked = true;
      //       this.alreadyDisliked = false;
      //       this.likes++;
      //       // console.log(this.alreadyLiked + " like = " + this.likes);
      //     }
      //     else if (data.ownVote.vote == "dislike") {
      //       this.alreadyLiked = false;
      //       this.alreadyDisliked = true;
      //       this.dislikes++;
      //     }
      //   }
      //   console.log(this.likes);
      // }
      // })
    });
    this.voteService.getVotes(id);
  }
  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
  ngOnInit() {
  }

}
