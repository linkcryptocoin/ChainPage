import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  currentUser: string = undefined;
  constructor(private titleService: Title) { 
    this.titleService.setTitle("领格-区块链-社交平台");
    this.currentUser = sessionStorage.getItem("currentUser");
  }

  ngOnInit() {
  }

}
