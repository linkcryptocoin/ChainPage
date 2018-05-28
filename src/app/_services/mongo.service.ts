import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class MongoService {
    //private readonly API = 'http://linkcryptocoin.com:8080/api/';
    private readonly API = 'http://' + location.hostname + ':8080/api/';
    constructor(private http: Http) { }

    saveListing(listing) {
        return this.http.post(this.API + 'saveListing/', listing)
        // .map((response: Response) =>response.json())
    }
    updateListing(listing) {
        return this.http.post(this.API + 'updateListing/', listing)
        // .map((response: Response) =>response.json())
    }
    GetListings() {
        return this.http.get(this.API + 'getListings/')
        // .map((response: Response) => response.json())
    }

    GetListingsByCat(cat) {
        // let params = new HttpParams().set('cat', cat);
        return this.http.get(this.API + 'getListingsByCat/' + cat)
        // .map((response: Response) => response.json())
    }
    GetListingsBySubcat(subcat) {
        // let params = new HttpParams().set('cat', cat);
        return this.http.get(this.API + 'getListingsBySubcat/' + subcat)
        // .map((response: Response) => response.json())              
    }
    GetListing(id) {
        console.log(id);
        // let params = new HttpParams().set('id', id);
        return this.http.get(this.API + 'getListing/' + id)
        // .map((response: Response) => response.json())
    }
    deleteListing(id) {
      console.log('--listing id passed  for delete request:' + id);
        return this.http.post(this.API + 'deleteListing/', {'id': id})
        // .map((response: Response) =>response.json())
    }
    addComment(comment){
        console.log(comment);
        return this.http.post(this.API + 'addComment/', comment)
    }
    updateComment(comment){
        console.log(comment);
        return this.http.post(this.API + 'updateComment/', comment)
    }
    deleteComment(comment){
        console.log(comment);
        return this.http.post(this.API + 'deleteComment/', comment)
    }
    addVote(vote){
        console.log(vote);
        return this.http.post(this.API + 'addVote/', vote)
    }
    deleteVote(vote){
        console.log(vote);
        return this.http.post(this.API + 'deleteVote/', vote)
    }
    searchListings(searchText:string){
        console.log(searchText);
        return this.http.get(this.API + 'searchListings/' + searchText)
    }
}
