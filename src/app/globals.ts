import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  readonly chainFormName = "mrofTest2";
  readonly chainPageComment = "mrofTestComment2";
  readonly chainPageVote = "mrofTestVote2";
  readonly tokenDeductAmmount_ChainpageComment = 5;
  readonly tokenDeductAmmount_ChainpageUpVote = 5;
  readonly tokenDeductAmmount_ChainpageDownVote = 10;
}