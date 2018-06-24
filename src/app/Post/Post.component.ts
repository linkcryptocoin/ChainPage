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
  categories: any[] = [];
  validatingForm: FormGroup;


  catarr: any[]= [];
  PostId: string;
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

    this.currentUser = sessionStorage.getItem('currentUser');
   // this.model.submitBy = this.currentUser;

    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);

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

     // console.log(this.model);
      this.model.appId = environment.ChainpostAppId;
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
  isAuthor(user: string): boolean {
    //console.log(this.currentUser.username == user);
    return this.currentUser == user;
  }


  ngOnInit() {
    // this.loadAllPosts();
  }

}
