import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { AuthorizeComponent } from './authorize/authorize.component';
import { CanActivateAuthorized } from './shared/guards/authorized.guard';
import { ProfileComponent } from './authorize/profile/profile.component';
import { PartyComponent } from './authorize/party/party.component';

const routes: Routes = [
    // login-section
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // authorized
    { path: 'authorized', component: AuthorizeComponent, canActivate: [CanActivateAuthorized], children: [
        { path: 'profile', component: ProfileComponent },
        { path: 'party', component: PartyComponent },
        { path: '', redirectTo: '/authorized/profile', pathMatch: 'full' }
    ]},

    // 404-page
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '/404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
