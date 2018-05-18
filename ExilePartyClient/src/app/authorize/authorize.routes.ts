import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanActivateAuthorized } from '../shared/guards/authorized.guard';
import { AuthorizeComponent } from './authorize.component';
import { ProfileComponent } from './profile/profile.component';
import { PartyComponent } from './party/party.component';

export const routes: Routes = [
    {
        path: '', canActivate: [CanActivateAuthorized], component: AuthorizeComponent, children: [
            { path: 'profile', component: ProfileComponent },
            { path: 'party', component: PartyComponent }
        ]
    },
];

export const authorizeRoutes: ModuleWithProviders = RouterModule.forChild(routes);
