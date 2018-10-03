import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  readonly chainFormName = "mrofTest2";
  readonly chainPageComment = "mrofTestComment2";
  readonly chainPageVote = "mrofTestVote2";
  readonly tokenDeductAmmount_ChainpageComment = 5;
  readonly tokenDeductAmmount_ChainpageUpVote = 5;
  readonly tokenDeductAmmount_ChainpageDownVote = 10;
  readonly ChainpageAppId = 1;
  readonly ChainpostAppId = 2;
  readonly action = { comment: "comment", like: "like", dislike: "dislike", post: "post", login: "login" };
  readonly ChainPageNewCommentSubject = "New comment posted";
  readonly ChainPageNewCommentMessageToAuthor = "A new comment has been posted for your listing<br/>";
  readonly ChainPageNewCommentMessageToProvider = "Thank you for your comment on<br/>";
  readonly ChainPostNewCommentSubject = "New comment posted";
  readonly ChainPostNewCommentMessageToAuthor = "A new comment has been posted for your post<br/>";
  readonly ChainPostNewCommentMessageToProvider = "Thank you for your comment on<br/>";
}