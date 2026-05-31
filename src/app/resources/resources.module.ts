import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  // NgbModalModule, NgbDropdownModule, NgbNav, NgbNavLinkButton, NgbNavItem, 
  NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { ResourcesRoutingModule } from './resources-routing.module';
import { StorageCommonModule } from '../common/storage-common.module';
import { NativesComponent } from './natives/natives.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { NativeFormComponent } from './natives/native-form/native-form.component';
import { HistoricalComponent } from './historical/historical.component';
import { HistoricalFormComponent } from './historical/historical-form/historical-form.component';

@NgModule({
  declarations: [
    NativesComponent, 
    UserComponent, 
    HomeComponent,
    NativeFormComponent,
    HistoricalComponent,
    HistoricalFormComponent
  ],
  imports: [
    CommonModule,
    ResourcesRoutingModule,
    FormsModule,
    StorageCommonModule,
    // NgbModalModule,     // 新增 NgbModalModule
    // NgbDropdownModule,  // 保留原有组件
    // NgbNav,
    // NgbNavLinkButton,
    // NgbNavItem,
    NgbTooltipModule,
  ],
})
export class ResourcesModule {}
