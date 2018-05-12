import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
// used to create fake backend
import { fakeBackendProvider } from './_helpers/index';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AlertComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { JwtInterceptor } from './_helpers/index';
import { AlertService, AuthenticationService, UserService, ClaimService, BigchanDbService, OothService, VoteService } from './_services/index';
import { HomeComponent } from './home/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';

import { MetaCoinService, Web3Service } from '../services/services';
import { ClaimComponent } from './claim/claim.component';
import { ContractComponent } from './contract/contract.component';
import { SideNavComponent } from './side-nav/side-nav.component'
import { Globals } from './globals'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TopNavComponent } from './top-nav/top-nav.component';
import { ClaimDetailComponent } from './claim-detail/claim-detail.component';
import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { MomentModule } from 'angular2-moment';
import { LandingComponent } from './landing/landing.component';
import { ListingsComponent } from './listings/listings.component';
import { ModalContent } from './modal/modal.component';
import { ProfileComponent } from './profile/profile.component'; // optional, provides moment-style pipes for date formatting
const SERVICES = [
  MetaCoinService,
  Web3Service,
]

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    ToasterModule.forRoot(),
    MomentModule,
    NgxQRCodeModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ClaimComponent,
    ContractComponent,
    SideNavComponent,
    TopNavComponent,
    ClaimDetailComponent,
    LandingComponent,
    ListingsComponent,
    ModalContent,
    ProfileComponent
  ],
  providers: [
    SERVICES,
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    ClaimService,
    BigchanDbService,
    OothService,
    Globals,
    VoteService,
    // provider used to create fake backend
    fakeBackendProvider
  ],
  entryComponents: [ModalContent],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}