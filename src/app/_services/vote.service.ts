import { Injectable, Output, EventEmitter } from '@angular/core';
import "rxjs/add/operator/map";
import { BigchanDbService } from './bigchangedb.service';
import { ToasterService } from 'angular2-toaster';
import { ISubscription } from "rxjs/Subscription";
import { Globals } from "../globals";
import { Vote } from '../_models/vote';
@Injectable()
export class VoteService {
  @Output() voteData: EventEmitter<any> = new EventEmitter();
  private subscription: ISubscription;
  votes: any[] = [];
  ownVote: any = undefined;
  ownVotes: any[] = [];
  // Flag to see if status update is in progress
  private inProgress: boolean = false

  // Possible available reactions
  private reactions: string[] = ['like', 'dislike']
  likes: number = 0;
  dislikes: number = 0;
  alreadyLiked: boolean = false;
  alreadyDisliked: boolean = false;

  // Class constructor, injects the angular fire database as this.af
  constructor(private toasterService: ToasterService, private bigchaindbService: BigchanDbService,
    private globals: Globals) { }

  // ----------------------------------------------------------------------
  // Method to post the status to bigchaindb
  // ----------------------------------------------------------------------

  vote(id: string, vote: string, user: string, formName: string): Promise<any> {
      // let payload = {
      //   id: id,
      //   type: formName,
      //   vote: vote,
      //   postedBy: user,
      //   postedTime: Date.now()
      // }
      let payload = new Vote(id, formName, vote, user, Date.now())
      return this.bigchaindbService.createTransaction(payload, formName)
        .then(
          data => {
            console.log(data);
            return Promise.resolve(data);
          },
          err => {
            console.log(err);
            return Promise.reject(err);
          }
        );
      // this.toasterService.pop('success', 'Submit successful');
      // this.statuses.push(payload).then(snapshot => {
      //   this.inProgress = false
      // })
  }

  // ----------------------------------------------------------------------
  // Method to get a transaction's votes
  // ----------------------------------------------------------------------
  getVotes(id: string): any {
    this.ownVotes = [];
    this.votes = [];
    this.ownVote = undefined;
    this.likes = 0;
    this.dislikes = 0;
    this.alreadyLiked = false;
    this.alreadyLiked = false;
    console.log("in getVotes()");
    let finalData: any;
    this.subscription = this.bigchaindbService.getAllTransactionsByAsset(id)
      .subscribe(        
        dataset => {
          JSON.parse(JSON.stringify(dataset)).forEach(element => {
            // console.log(element.data);
            if (element.data.type == this.globals.chainPageVote) {
              if (sessionStorage.getItem("currentUser") != undefined) {
                if (element.data.postedBy == sessionStorage.getItem("currentUser").toString()) {
                  this.ownVotes.push(element.data);
                }
                else {
                  this.votes.push(element.data);
                }
              }
              else {
                this.votes.push(element.data);
              }
            }
          });
          // console.log(this.ownVotes);
          if (this.ownVotes.length > 0 && this.ownVotes.length <= 1) {
            this.ownVote = this.ownVotes[0];
          }
          else if (this.ownVotes.length > 1) {
            let max = Math.max.apply(Math, this.ownVotes.map(function (o) { return o.postedTime; }));
            this.ownVotes.forEach(vote => {
              if (vote.postedTime == max) {
                this.ownVote = vote;
              }
            })
          }
          // console.log(alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.postedBy = b.postedBy AND a.postedTime < b.postedTime Where b.postedBy IS null", [this.comments,this.comments]));
          this.votes = alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.postedBy = b.postedBy AND a.postedTime < b.postedTime Where b.postedBy IS null", [this.votes, this.votes]);
          // console.log(this.votes);
          finalData = {
            ownVote: this.ownVote,
            votes: this.votes
          }
          // console.log(data);
          // return data;
        },
        err => {
          // console.log(JSON.stringify(err));
          this.toasterService.pop('error', 'Failed to load votes');
        },
        () => { 
          // console.log("in complete");
          
          this.countVote(finalData);
          let result = {
            voteData: finalData,
            likes: this.likes,
            dislikes: this.dislikes,
            alreadyLiked: this.alreadyLiked,
            alreadyDisliked: this.alreadyDisliked
          }
          console.log(result);
          this.voteData.emit(result);
        }
      );
  }
  countVote(data: any){    
    if (data != undefined) {
      // console.log(data.votes)
      if (data.votes && data.votes.length > 0) {
        this.likes = (alasql("SELECT count(*) as cnt FROM ? Where vote = 'like'", [data.votes]))[0].cnt;
        this.dislikes = (alasql("SELECT count(*) as cnt FROM ? Where vote = 'dislike'", [data.votes]))[0].cnt;
        // console.log("like = " + this.likes + " dislike = " + this.dislikes);
      }
      // console.log((alasql("SELECT count(*) as cnt FROM ? Where vote = 'like'", [data.votes]))[0].cnt)
      if (data.ownVote) {
        if (data.ownVote.vote == "like") {
          this.alreadyLiked = true;
          this.alreadyDisliked = false;
          this.likes++;
          // console.log(this.alreadyLiked + " like = " + this.likes);
        }
        else if (data.ownVote.vote == "dislike") {
          this.alreadyLiked = false;
          this.alreadyDisliked = true;
          this.dislikes++;
        }
      }
      console.log(this.likes);
    }
  }
  // ----------------------------------------------------------------------
  // Method to check the in progress flag
  // ----------------------------------------------------------------------

  updating(): boolean {
    return this.inProgress
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
