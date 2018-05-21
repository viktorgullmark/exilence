import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthorizeComponent } from './authorize/authorize.component';
import { PartyComponent } from './authorize/party/party.component';
import { DashboardComponent } from './authorize/dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CanActivateAuthorized } from './shared/guards/authorized.guard';

const routes: Routes = [
    // login-section
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // authorized
    { path: 'authorized', component: AuthorizeComponent,  canActivate: [CanActivateAuthorized], children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'party', component: PartyComponent },
        { path: '', redirectTo: '/authorized/dashboard', pathMatch: 'full' }
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
