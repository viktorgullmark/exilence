import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
    {   // lazy load authorize-section
        path: '', loadChildren: 'app/authorize/authorize.module#AuthorizeModule'
    },
    {
        path: '', children: [
            { path: 'login', component: LoginComponent }
        ]
    },
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '/404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
