import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Session Expiring</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>{{name}}</p>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-primary" (click)="activeModal.close('extend')">Keep logged in</button>
      <button type="button" class="btn btn-warning" (click)="activeModal.close('logout')">Log out</button>
    </div>
  `
})
export class ModalContent {
  @Input() name;

  constructor(public activeModal: NgbActiveModal) {}

}