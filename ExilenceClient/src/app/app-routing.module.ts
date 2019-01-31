import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthorizeComponent } from './authorize/authorize.component';
import { PartyComponent } from './authorize/party/party.component';
import { DashboardComponent } from './authorize/dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CanActivateAuthorized } from './shared/guards/authorized.guard';
import { InspectPlayersComponent } from './authorize/inspect-players/inspect-players.component';
import { SettingsComponent } from './authorize/settings/settings.component';
import { DisconnectedComponent } from './disconnected/disconnected.component';
import { FaqComponent } from './authorize/faq/faq.component';

const isElectron = window && window.process && window.process.type;

const routes: Routes = [
    // authorized
    {
        path: 'authorized', component: AuthorizeComponent, children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'party', component: PartyComponent },
            { path: 'inspect-players', component: InspectPlayersComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'faq', component: FaqComponent },
            { path: '', redirectTo: '/authorized/dashboard', pathMatch: 'full' }
        ]
    },

    // login-section
    { path: 'login', component: LoginComponent },
    { path: 'group', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },



    { path: 'disconnected/:external', component: DisconnectedComponent },

    // 404-page
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '/404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: isElectron })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
