import { Component, OnInit } from '@angular/core';
import { Post, User, Vote } from '../_models/index'
import { UserService, AlertService, BigchanDbService, MongoService, SwarmService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Globals } from '../globals'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Validators , AbstractControl, NG_VALIDATORS , FormGroup,  FormBuilder } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import { environment } from 'environments/environment.prod';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-Post',
  templateUrl: './Post.component.html',
  styleUrls: ['./Post.component.css']
})
export class PostComponent implements OnInit {

  urls = new Array<string>();
  currentUser: string;
  model: any = {};
  Posts: Post[] = [];
  submitted = false;
  channels: any[] = [];
  validatingForm: FormGroup;
  postId: string;
  isUpdate: boolean = false;
  maincategoryid: this;
  constructor(
    private router: Router, private route: ActivatedRoute, private translate: TranslateService,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals, private mongoService: MongoService,
    private alertService: AlertService, private toasterService: ToasterService,
    private http: Http, private swarmService: SwarmService, private fb: FormBuilder
  ) {


    this.validatingForm = fb.group({
      'Title': [null, Validators.minLength(3)],
  });

  this.http.get('/assets/postcat.json')
      .subscribe(data => {
        this.channels = data.json();
        //console.log(data);
      });

    this.currentUser = sessionStorage.getItem('currentUser');
    this.model.submitBy = this.currentUser;
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      this.postId = params['id'];
      if (this.postId) {
        this.getPost(this.postId);
      }
    });


  }


  async onSubmit() {
    //upload logo first
   // this.swarmService.uploadFile(this.urls[0]);


    this.submitted = true;
    // set the upload time stamp
    delete this.model["__v"]
    // if (this.model.id === undefined) {
    //   this.model.id = "NA";
    // }
    this.model.postedBy = this.currentUser;
    this.model.postedTime = Date.now();
    console.log("model = " + JSON.stringify(this.model));
    if (this.isUpdate == true) {
      // console.log(this.model);
      this.model.appId = this.globals.ChainpostAppId;
      this.mongoService.updateListing(this.model)
        .subscribe(response => {
          // console.log(response);
          this.toasterService.pop('success', 'Update successful');
          this.router.navigate(['/chainpost/Post-detail'], { queryParams: { id: this.postId } });
        },
          err => {
            this.toasterService.pop("error", "fail to update listing");
          }
        );
    }
    else {

      this.model.appId = this.globals.ChainpostAppId;
      this.mongoService.saveListing(this.model)
        .subscribe(
          response => {
            console.log(response);
            if (response.status === 200) {
              let id: String = JSON.parse(JSON.stringify(response))._body;
              id = id.replace(/"/g, "");
              this.toasterService.pop('success', 'Posted successful');
              this.router.navigate(['/chainpost/Post-detail'], { queryParams: { id: id } });
            }
            else {
              this.toasterService.pop("error", "fail to submit Post");
            }
          },
          err => {
            this.toasterService.pop("error", "fail to submit Post");
          }
        );

    }
     // console.log(this.model);


  }


  getPost(id: string){
    this.mongoService.GetListing(id, this.globals.ChainpostAppId)
    .subscribe(response => {
     // console.log(response)
      this.model = response.json();

      this.isUpdate = true;
    });
  }

  isAuthor(user: string): boolean {
    //console.log(this.currentUser.username == user);
    return this.currentUser == user;
  }


  ngOnInit() {
    // this.loadAllPosts();
  }

}
