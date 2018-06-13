import { Component, OnInit } from '@angular/core';
import { Post, User, Vote } from '../_models/index'
import { UserService, AlertService, BigchanDbService, MongoService, SwarmService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../globals'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Validators , AbstractControl, NG_VALIDATORS } from '@angular/forms';

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
  subcategories: any[] = [];
  countries: any[] = [];
  states: any[] = [];
  provinces: any[] = [];
  catarr: any[]= [];
  state_province: any[] = [];
  PostId: string;
  isUpdate: boolean = false;
  maincategoryid: this;
  constructor(
    private router: Router, private route: ActivatedRoute, private translate: TranslateService,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals, private mongoService: MongoService,
    private alertService: AlertService, private toasterService: ToasterService,
    private http: Http, private swarmService: SwarmService
  ) {
    this.currentUser = sessionStorage.getItem('currentUser');
    this.model.submitBy = this.currentUser;
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      this.PostId = params['id'];
      if (this.PostId) {
        this.getPost(this.PostId);
      }
    });
    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);

      });

    this.http.get('/assets/country.json')
      .subscribe(data => {
        this.countries = data.json();
        //console.log(data);
      });
  }
  MainCategoryDropDownChanged(newValue: string) {
    // console.log(newValue);

    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.catarr = data.json().filter((item) => item.Description == newValue);

             this.maincategoryid = this.catarr[0].Category;
              // console.log(this.maincategoryid);
      });
 this.http.get('/assets/subCat.json')
      .subscribe(data => {
        this.subcategories = data.json().filter((item) => item.Category == this.maincategoryid);



        // console.log(this.subcategories);
      });

  }
  onChange(newValue: string) {
    if (newValue.toLowerCase() == "usa") {
      // console.log(newValue);
      this.http.get('/assets/us_states.json')
        .subscribe(data => {
          this.states = data.json();
          this.state_province = this.states;
          //console.log(data);

        });
    }
    else if (newValue.toLowerCase() == "canada") {
      // console.log(newValue);
      this.http.get('/assets/canada_provinces.json')
        .subscribe(data => {
          this.provinces = data.json();
          this.state_province = this.provinces;
          //console.log(data);
        });
    }
  }
  getPost(id: string) {
    this.mongoService.GetListing(id)
      .subscribe(response => {
        // console.log(response)
        this.model = response.json();
        this.isUpdate = true;
        // let PostData = JSON.parse(JSON.stringify(data));
        // this.model = PostData.asset.data;
        // if (this.model.id === "NA") {
        //   this.model.id = PostData.id;
        // }
        // console.log(this.model);
        this.onChange(this.model.country);
      });
  }
  async onSubmit() {
    //upload logo first
    this.swarmService.uploadFile(this.urls[0]);


    this.submitted = true;
    // set the upload time stamp
    delete this.model["__v"]
    // console.log("model = " + JSON.stringify(this.model));
    // if (this.model.id === undefined) {
    //   this.model.id = "NA";
    // }
    this.model.postedBy = this.currentUser;
    this.model.postedTime = Date.now();
    if(this.isUpdate == true){
      // console.log("this is an update");
      this.mongoService.updateListing(this.model)
      .subscribe(response => {
        // console.log(response);
        this.toasterService.pop('success', 'Update successful');
        this.router.navigate(['/home']);
      });
    }
    else{
    //upload to mongodb
    // console.log(this.model);
   this.mongoService.saveListing(this.model)
      .subscribe(
        response => {
          // console.log(response);
          this.toasterService.pop('success', 'Submit successful');
          this.router.navigate(['/home']);
        })
      }

  }

  approvePost(id: number) {
    alert("approved");
  }
  // private loadAllPosts() {
  //   this.PostService.getAll().subscribe(Posts => { this.Posts = Posts; });
  // }
  isAuthor(user: string): boolean {
    //console.log(this.currentUser.username == user);
    return this.currentUser == user;
  }
  countryDropDownChanged(value: any) {
    if (value == "2") {
      this.state_province = this.provinces;
    }
    else {
      this.state_province = this.states;
    }
  }
 
  detectFiles(event) {
    console.log(event);
    this.urls = [];
    let files = event.target.files;
    console.log(files);
    if (files) {
      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.urls.push(e.target.result);
        }
        reader.readAsDataURL(file);
      }
    }
    console.log(this.urls);
  }
  ngOnInit() {
    // this.loadAllPosts();
  }

}
