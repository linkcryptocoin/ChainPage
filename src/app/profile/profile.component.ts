import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { OothService } from '../_services';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  showPassword = false;
  userName: string;
  tokenBalance: number;
  accountNumber: string;
  profilePages: string[];
  selectedPage: string;
  accountEmail:string;
  toAddress:string;
  token: number;
  constructor(private oothService: OothService, private route: ActivatedRoute
            , private toasterService: ToasterService, private translate: TranslateService) { 
    this.accountNumber = sessionStorage.getItem("currentUserAccount");
    this.accountEmail = sessionStorage.getItem("currentUserEmail");
    this.route.queryParams.subscribe(params => {      
      this.userName = params["user"];
    });
    this.profilePages = new Array("Account Information", "Account Settings");
    this.selectedPage = this.profilePages[0];
    // let balanceSession = sessionStorage.getItem('tokenBalance');
    //     if (balanceSession) {
    //       this.tokenBalance = Number.parseFloat(balanceSession);
    //       console.log("session balance=" + balanceSession)
    //     }
    //     else {
    //       this.oothService.getTokenBalance(this.accountNumber)
    //         .then(balance => {
    //           console.log("balance=" + balance)
    //           this.tokenBalance = balance;
    //         });
    //     }
  }
  togglePass(){
    this.showPassword = !this.showPassword;
  }
  sendToken(){
    if(confirm("Are you sure you want to transfer tokens to another account?")) {
      //alert("Sending..")
      console.log(this.token)
      this.oothService.transferToken(this.toAddress, this.token)
      .then(res => {
        if(res.status == 200){
          this.translate.get('Tokens transferred successfully!')
          .subscribe(trans => {
            console.log(trans);
            this.toasterService.pop("success", "Tokens transferred successfully!");
          });          
        }
        else{
          this.translate.get('Failed to transfer tokens!')
          .subscribe(trans => {
            console.log(trans);
            this.toasterService.pop("error", "Failed to transfer tokens!");
          });              
        }
      });
    }    
  }
  onPageClick(value){
    // console.log(value);
    this.selectedPage = value.trim();
  }
  ngOnInit() {
    this.oothService.getTokenBalance(this.accountNumber)
            .then(balance => {
              console.log("balance=" + balance)
              this.tokenBalance = balance;
            });
  }

}
