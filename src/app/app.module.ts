import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  NgbModalModule,
  NgbDropdownModule,
  NgbNav,
  NgbNavLinkButton,
  NgbNavItem,
} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // NgbModule
    NgbModalModule,
    NgbDropdownModule,
    NgbNav,
    NgbNavLinkButton,
    NgbNavItem,
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
