import { Component, OnInit } from '@angular/core';
import { OothService } from '../_services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {

  private userName: string;
  private action: string;
  constructor(private route: ActivatedRoute, private oothService: OothService) { 
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      this.userName = params['user'];
      this.action = params['action'];
      console.log(this.userName, this.action);
      oothService.onActivateUser(this.userName, this.action);
    });
  }

  ngOnInit() {
  }

}
