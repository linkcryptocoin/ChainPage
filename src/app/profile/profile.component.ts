import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { OothService } from '../_services';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName: string;
  tokenBalance: number;
  accountNumber: string;
  profilePages: string[];
  selectedPage: string;
  constructor(private oothService: OothService, private route: ActivatedRoute) { 
    this.accountNumber = sessionStorage.getItem("currentUserAccount");
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
