import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable()
export class MongoService {
    //private readonly API = 'http://linkcryptocoin.com:8080/api/';
    private readonly API = location.protocol + '//' + location.hostname + ':8080/api/';
    constructor(private http: Http) { }

    saveListing(listing) {
        return this.http.post(this.API + 'saveListing/', listing)
        // .map((response: Response) =>response.json())
    }
    updateListing(listing) {
        return this.http.post(this.API + 'updateListing/', listing)
        // .map((response: Response) =>response.json())
    }
    GetListings(appId) {
        return this.http.get(this.API + 'getListings/' + appId)
        // .map((response: Response) => response.json())
    }

    GetListingsByCat(cat, appId) {
        // let params = new HttpParams().set('cat', cat);
        return this.http.get(this.API + 'getListingsByCat/' + cat + "/" + appId)
        // .map((response: Response) => response.json())
    }
    GetListingsBySubcat(subcat, appId) {
        // let params = new HttpParams().set('cat', cat);
        return this.http.get(this.API + 'getListingsBySubcat/' + subcat + "/" + appId)
        // .map((response: Response) => response.json())              
    }
    GetListing(id, appId) {
        console.log(id);
        let params = new URLSearchParams();
        params.append('id', id);
        params.append('appId', appId);
        // let params = new HttpParams().set('id', id);
        return this.http.get(this.API + 'getListing/' + id + "/" + appId)
        // .map((response: Response) => response.json())
    }
    deleteListing(id, appId) {
      console.log('--listing id passed  for delete request:' + id);
        return this.http.post(this.API + 'deleteListing/', {'id': id, 'appId': appId})
        // .map((response: Response) =>response.json())
    }
    getViewCount(id, appId) {
        console.log(id);
        let params = new URLSearchParams();
        params.append('id', id);
        params.append('appId', appId);
        // let params = new HttpParams().set('id', id);
        return this.http.get(this.API + 'getViewCount/', { search: params })
        // .map((response: Response) => response.json())
    }
    incrementViewCount(id, appId){
        console.log(id);
        return this.http.post(this.API + 'incrementViewCount/', {'id': id, 'appId': appId})
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
    searchListings(searchtext:string, appId){
        console.log(searchtext);
        // let params = new URLSearchParams();
        // params.append('searchtext', searchText);
        // params.append('appId', appId);
        return this.http.get(this.API + 'searchListings/' + searchtext + "/" + appId);
    }
}
