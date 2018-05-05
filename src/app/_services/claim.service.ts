import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { BigchanDbService } from './index';
import { Claim } from '../_models/index';
import { Globals } from '../globals'
@Injectable()
export class ClaimService {
    constructor(private http: HttpClient, //private bigchaindbService: BigchanDbService,
        private globals: Globals,) { }

    getAll() {
        return this.http.get<Claim[]>('/api/claims');
    }

    getById(id: number) {
        return this.http.get('/api/claim/' + id);
    }
    getByCat(cat: number) {
        return this.http.get('/api/claims/' + cat);
    }
    create(claim: Claim) {
        return this.http.post('/api/claims', claim);
    }

    // update(claim: Claim) {
    //     return this.http.put('/api/claims/' + claim.id, claim);
    // }

    delete(id: number) {
        return this.http.delete('/api/claims/' + id);
    }
}