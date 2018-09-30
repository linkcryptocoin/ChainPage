import { Component, OnInit, Input, AnimationTransitionEvent } from '@angular/core';
import { UserService, ClaimService, AlertService, BigchanDbService, MongoService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response, Jsonp } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../_services/index';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Globals } from '../globals'
import { Observable } from 'rxjs/Observable';
// import { HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import { filter } from 'rxjs/operators';
import { ISubscription } from 'rxjs/Subscription';
import { User, Claim } from '../_models/index';
import { forEach } from '@angular/router/src/utils/collection';
// import { HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import * as alaSQLSpace from 'alasql';
import { error, element } from 'protractor';
import { environment } from 'environments/environment.prod';

@Component({
  moduleId: module.id.toString(),
  templateUrl: './chainpost.component.html',
  styleUrls: ['./chainpost.component.css']
})

export class ChainPostComponent implements OnInit {
  private _opened: boolean = false;
  categories: any[] = [];
  channels: any[] = [];
  dynamicsidenavlist: any[] = [];
  dynamicsidenavlist_Count: any[] = [];
  tempVar: number;
  num: number;

  Channel_cats: any[] = [];
  Channel_Count: number = 0;

  DynamicChannel: any = {};
  DynamicChannelcats: any[] = [];

  private subscription: ISubscription;
  currentUser: User;
  model: any = {};

  Posts: any[] = [];



  private _toggleSidebar() {
    // console.log("shout out from toggle bar");
    this._opened = !this._opened;

  }

  private CloseSidebar() {
    //  console.log("shout out from cloooooose toggle bar");
    this._opened = this._opened;

  }
  constructor(private http: Http, private globals: Globals,
    private authenticationService: AuthenticationService, private router: Router,
    private route: ActivatedRoute, private mongoService: MongoService,
    private userService: UserService, private toasterService: ToasterService,
    private alertService: AlertService, private translate: TranslateService) {

    this.http.get('/assets/postcat.json')
      .subscribe(data => {
        this.categories = data.json();
        // console.log(this.categories.length);

        for (var i = 0; i < this.categories.length; i++) {

          this.Channel_cats.push(this.categories[i].Description);
          // console.log(this.Channel_cats.length);

        }
      });
    //console.log("channel_cats : "+ this.Channel_cats);
    this.subscription = this.mongoService.GetListings(this.globals.ChainpostAppId)
      .subscribe(response => {

        if (response.status == 200) {
          // console.log(response.json());
          this.Posts = response.json();

          this.model = this.Posts;
        }
        else {
          this.toasterService.pop("error", response.statusText);
        }


        //console.log('--------------------------- : ' + JSON.stringify(this.model[0]));

        for (let j = 0; j < this.Channel_cats.length; j++) {

          this.Channel_Count = 0;

          for (let i = j; i < this.model.length; i++) {

            if (this.Channel_cats[j] === this.model[i].Channel) {
              this.Channel_Count++;
            }

          }

          // if (this.Channel_Count != 0) {

          this.DynamicChannel = {
            'ChannelName': this.Channel_cats[j],
            'ChannelCount': this.Channel_Count
          }
          this.DynamicChannelcats.push(this.DynamicChannel);
        }
        this.dynamicsidenavlist = [];
        this.DynamicChannelcats.sort(SortByID);

        for (let i = 0; i < this.DynamicChannelcats.length; i++) {
          this.dynamicsidenavlist.push(this.DynamicChannelcats[i].ChannelName);
        }
        // console.log("-----------DynamicChannelcats  :"+ JSON.stringify(this.DynamicChannelcats));
      });

    function SortByID(x, y) {
      return y.ChannelCount - x.ChannelCount;
    }
  }
  ngOnInit() { }
}
