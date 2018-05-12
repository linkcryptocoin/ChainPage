import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/index';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { AuthGuard } from './_guards/index';
import { ContractComponent } from './contract/contract.component';
import { ClaimComponent } from './claim/claim.component';
import { ClaimDetailComponent } from './claim-detail/claim-detail.component';
import { ListingsComponent } from './listings/listings.component';
import { ProfileComponent } from './profile/profile.component';
const appRoutes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'landing', component: LandingComponent },
    { path: 'home', component: HomeComponent, children:[
        { path: '', component: ListingsComponent },
        { path: 'listing:/cat', component: ListingsComponent },
        { path: 'contract', component: ContractComponent, canActivate: [AuthGuard] },
        { path: 'claim', component: ClaimComponent, canActivate: [AuthGuard] },
        { path: 'claim-detail', component: ClaimDetailComponent }
    ] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, 
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);