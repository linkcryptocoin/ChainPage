import { Component, OnInit, Input , AnimationTransitionEvent} from '@angular/core';
import { UserService, ClaimService, AlertService, BigchanDbService, MongoService  } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
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
 dynamicsidenavlist: any = {};

 Channel_cats: any[] = [];
 Channel_Count: any[] = [];


 private subscription: ISubscription;
 currentUser: User;
 model: any = {};

 Posts: any[] = [];


 private _toggleSidebar() {
    // console.log("shout out from toggle bar");
    this._opened = !this._opened;

  }

  private CloseSidebar(){
     //  console.log("shout out from cloooooose toggle bar");
      this._opened = this._opened;

  }
    constructor(private http: Http, private globals: Globals ,
    private authenticationService: AuthenticationService, private router: Router, private route: ActivatedRoute,  private mongoService: MongoService,
    private userService: UserService, private toasterService: ToasterService,
    private alertService: AlertService, private translate: TranslateService) {

    //console.log("side-nav: " + globals.isLoggedIn);
    // if (this.currentUser != undefined) {
    //   console.log(this.currentUser.username);
    // }
    // else{console.log("side-nav: no user")}
    this.http.get('/assets/postcat.json')
      .subscribe(data => {
        this.categories = data.json();
       // console.log(this.categories.length);

        for(var i=0; i < this.categories.length; i++)
        {

          //console.log("--------channel_cats : "+ this.categories[i].Description);
          this.Channel_cats.push(this.categories[i].Description);
         console.log(this.Channel_cats.length);

        }



      });





      //console.log("channel_cats : "+ this.Channel_cats);
      this.subscription = this.mongoService.GetListings(this.globals.ChainpostAppId)
      .subscribe(response => {
        if (response.status == 200) {
          console.log(response.json());
          this.Posts= response.json();

          this.model = this.Posts;

          console.log("--1--");
          //console.log('--------------------------- : ' + JSON.stringify(this.model[0]));

          for(var j=0; i < this.Channel_cats.length; j++)
          {
            let channelCount = 0;
            console.log("--1--");
            console.log("--------Channel_Count"+this.Channel_cats[j].Description);

            for (var i = 0; i < this.model.length; i++) {


              console.log("--1--");
              console.log("-----------Channel_Count"+this.model[i].Channel);


              if(this.Channel_cats[j] === this.model[i].Channel){

                  channelCount++;

                }

                      /*  this.http.get('/assets/postcat.json')
                        .subscribe(data => {
                          this.Channel_cats = data.json().filter((item) => item.Description == this.model[i].Channel);

                          channelCount++;

                          console.log('channelCount++ : ' + channelCount++);


                          console.log('element.channel : ' + this.model[i].Channel);
                        });*/



             // });

            }


          }




        }
        else {
          this.toasterService.pop("error", response.statusText);
        }
      });






  }

    ngOnInit() { }

}
