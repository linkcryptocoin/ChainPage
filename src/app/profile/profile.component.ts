import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { OothService } from '../_services';
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
  constructor(private oothService: OothService, private route: ActivatedRoute) { 
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
      console.log(this.toAddress)
      this.oothService.transferToken(this.toAddress, this.token)
      .then(res => {
        console.log(res)
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
