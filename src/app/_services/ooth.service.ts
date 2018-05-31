import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Globals } from '../globals'
import { Claim } from '../_models/index';
import { Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Get the Idp endpoint
function getApiPath() {
    var host = "";
    // for a local run, use qa Idp
    if (location.hostname === 'localhost')
        host = '34.238.58.243';
    else 
        host = location.hostname;
    //readonly API_PATH = 'http://linkcryptocoin.com:8091/auth/';
    return location.protocol + '//' + host + ':8091/auth/'; 
}
@Injectable()
export class OothService {
    @Output() getLoggedInName: EventEmitter<any> = new EventEmitter();
    @Output() getLoggedInUserName: EventEmitter<any> = new EventEmitter();
    @Output() getLoggedInAccount: EventEmitter<any> = new EventEmitter();
    @Output() getAccountBalance: EventEmitter<any> = new EventEmitter();
    @Output() logginStatus: EventEmitter<any> = new EventEmitter();
    //readonly API_PATH = 'http://linkcryptocoin.com:8091/auth/';
    readonly API_PATH = getApiPath();
    conn: any;
    //user: any;
    authenticated: boolean;

    constructor(private http: HttpClient, private globals: Globals, private router: Router) {

    }

    async register(dname: string, email: string, password: string) {
        //e.preventDefault()
        //const email = document.getElementById('register-email').nodeValue
        //const password = document.getElementById('register-password').nodeValue
        const res = await fetch(this.API_PATH + 'local/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                dname
            }),
            credentials: 'include',
        })

        const body = await res.json()
        if (body.status === 'error') {
            console.log(body.message)
            return body.status;
        }
        console.log(body);
        this.router.navigate(['/login']);
        //await this.loginWithEmailPassword(email, password);
    }

    async Login(username: string, password: string) {
        // console.log(username + " " + password);
        const res = await fetch(this.API_PATH + 'local/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
            }),
            credentials: 'include',
        })
        // alert(res)
        const body = await res.json()
        if (body.status !== 'error') {
            this.setSession(body.user.local.email);
            this.authenticated = true;
            this.getLoggedInName.emit(body.user.local.email);
            this.logginStatus.emit(true);
            if (body.user.local.dname) {
                this.getLoggedInUserName.emit(body.user.local.dname);
                sessionStorage.setItem('currentUser', body.user.local.dname);
            }
            else {
                this.getLoggedInUserName.emit(body.user.local.email);
                sessionStorage.setItem('currentUser', body.user.local.email);
            }
            sessionStorage.setItem("currentUserId", body.user._id);
            sessionStorage.setItem('currentUserEmail', body.user.local.email);
            sessionStorage.setItem('currentUserAccount', body.user.local.account);
        }
        else {
            return { status: "error", message: body };
        }
        // generate token and save to session
        await this.onGenerateVerificationToken();
        console.log('body console---' + body.user.local);
        console.log('-----Account.local---' + body.user.local.account);
        console.log('-----Username.local---' + body.user.local.dname);
        console.log('-----Account.email---' + body.user.local.email);

        return body
    }
    async Logout() {
        const res = await fetch(this.API_PATH + 'logout', {
            method: 'POST',
            credentials: 'include',
        })
        const body = await res.json()
        if (body.status !== 'error') {
            this.authenticated = false;
            this.getLoggedInName.emit(undefined);
            this.getLoggedInUserName.emit(undefined);
            // this.getLoggedInAccount.emit(undefined);
            this.logginStatus.emit(false);
        }
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("currentUserId");
        sessionStorage.removeItem("currentUserEmail");
        sessionStorage.removeItem("expires_at");
        sessionStorage.removeItem("oothtoken");
        sessionStorage.removeItem("currentUserAccount");
        sessionStorage.removeItem("tokenBalance");
        return body;
    }
    // GenerateV Verification Token
    async onGenerateVerificationToken() {
        //alert("onGeneareVerificationToken");
        // e.preventDefault()
        let user = await this.getUser()
        // alert("name: " + user.local.email);
        let ouser = { _id: user._id, name: { email: user.local.email } }
        let res = await fetch(this.API_PATH + 'local/generate-verification-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ouser),
            credentials: 'include',
        });
        const body = await res.json();
        console.log(body);
        // alert(`${body.message} - ${body.token}`);
        sessionStorage.setItem('oothtoken', body.token);
    }
    async onVerify() {
        console.log("onVerify");
        // e.preventDefault();
        const user = await this.getUser();
        console.log(user);
        if (user != null) {
            const userId = user._id;
            // console.log(`user Id: ${userId}`);
            const token = sessionStorage.getItem("oothtoken");
            console.log("token: " + token);
            const res = await fetch(this.API_PATH + 'local/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    token,
                }),
                credentials: 'include',
            });
            const body = await res.json();
            return body.message;
        }
        else {
            return false;
        }
    }
    async getUser() {
        const res = await fetch(this.API_PATH + 'status', {
            credentials: 'include',
        })
        const body = await res.json()
        if (body.status === 'error') {
            alert(body.message)
            return body.status;
        }
        return body.user;
    }
    async isLoggedIn() {
        let status = await this.getUser();
        // console.log(status);
        if (status === 'error' || status === null
            || status === undefined || status === '') {
            // console.log("return false");
            return false;
        }
        else {
            // console.log("return true");
            return true;
        }
    }
    private setSession(user: any) {
        let expiresAt = Date.now() + environment.inactivitySec * 1000;
        // console.log(expiresAt)
        // console.log(user)
        sessionStorage.setItem('currentUser', user);
        sessionStorage.setItem("expires_at", expiresAt.toString());
        //console.log("SESSION:" + sessionStorage.getItem('currentUser'));
    }

    // Get the balance of the token
    async getTokenBalance(addr: string) {
        console.log("account: " + addr);
        // const res = await fetch(this.API_PATH + 'local/t-balanceOf', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         addr,
        //     }),
        //     credentials: 'include',
        // });
        // const body = await res.json();
        // let balance = Math.round(parseFloat(body.result) * 100) / 100;
        // this.getAccountBalance.emit(balance);
        // sessionStorage.setItem('tokenBalance', balance.toString());
        // console.log("balance: " + balance);
        // return balance;
        const res = await fetch(this.API_PATH + 'local/t-balanceOf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account: addr,
            }),
            credentials: 'include',
        })
        const body = await res.json()
        // alert(`${body.message} ${body.result}`) 
        return body.result;
    }

    // deduct token from current account
    async deductToken(account: string, amount: number) {
        const res = await fetch(this.API_PATH + 'local/t-deductRewards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: account,
                token: amount
            }),
            credentials: 'include',
        });
        const body = await res.json();
        console.log("body: " + JSON.stringify(body))
        let balance = Math.round(parseFloat(body.result) * 100) / 100;
        this.getAccountBalance.emit(balance);
        return body;
    }
}
