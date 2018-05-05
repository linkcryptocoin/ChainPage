import { Component, HostListener, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service, MetaCoinService } from '../services/services'
import { OothService } from './_services/index';
import { canBeNumber } from '../util/validation';
import { TranslateService } from '@ngx-translate/core';
declare var window: any;
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Idle, DEFAULT_INTERRUPTSOURCES, AutoResume } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from './modal/modal.component';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import { globals } from 'globals';
import { Globals } from './globals';
import { environment } from '../environments/environment';
@Component({
  moduleId: module.id.toString(),
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  subscription: ISubscription;
  idleState = 'Not started.';
  countdownMsg: string;
  timedOut = false;
  lastPing?: Date = null;
  closeResult: string;
  modalRef: any;
  public config: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 0
    });

  constructor(
    private _ngZone: NgZone, private toasterService: ToasterService,
    private web3Service: Web3Service, private router: Router,
    private metaCoinService: MetaCoinService,
    private translate: TranslateService, private modalService: NgbModal,
    private idle: Idle, private keepalive: Keepalive, private globals: Globals,
    private oothservice: OothService
  ) {
    translate.setDefaultLang('cn');

    idle.onIdleStart.subscribe(() => {
      if (this.modalRef != undefined) {
        this.modalRef.close();
      }
      console.log("in onIdleStart()");
      this.openModal();
    });
    this.oothservice.logginStatus
      .subscribe(status => {
        if (status) {
          // this.reset();
          if (this.modalRef != undefined) {
            this.modalRef.close();
          }
          console.log(status);
          // sets an idle timeout of 5 seconds, for testing purposes.
          idle.setIdle(environment.inactivitySec);
          // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
          idle.setTimeout(30);
          // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
          idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
          idle.setAutoResume(AutoResume.notIdle);

          // idle.onIdleEnd.subscribe(() => {
          //   if (this.modalRef != undefined) {
          //     this.modalRef.close();
          //   }
          //   console.log("in onIdleEnd()");
          // });
          idle.onTimeout.subscribe(() => {
            if (this.modalRef != undefined) {
              this.modalRef.close();
            }
            // console.log("in onTimeout()");
            this.oothservice.Logout();
            this.router.navigate(['/login']);
          });

          // sets the ping interval to 15 seconds          
          keepalive.interval(environment.pingIntervalSec);
          keepalive.onPing.subscribe(() => {
            this.lastPing = new Date();
            console.log("keep active called")
          });
          this.reset();
        }
        else {
          // console.log(status);
          this.idle.stop();
        }
      });
  }
  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }
  openModal() {
    // this.idle.clearInterrupts();
    this.modalRef = this.modalService.open(ModalContent);
    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.modalRef.componentInstance.name = 'You will be logged out in ' + countdown + ' seconds!'

    });
    this.modalRef.result.then((result) => {
      this.closeResult = result;
      if (this.closeResult == "logout") {
        // console.log("close result: " + this.closeResult)
        this.oothservice.Logout();
        this.router.navigate(['/login']);
      }
      else {
        this.reset();
      }
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.reset();
    });
  }
  // open(content) {
  //   this.modalService.open(content).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }
  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }
}
