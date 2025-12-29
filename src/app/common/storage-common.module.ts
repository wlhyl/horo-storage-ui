import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 双向绑定
import { FormsModule } from '@angular/forms';

import {
  // NgbToastModule,
  // NgbDropdownModule,
  NgbAlertModule,
  // NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

// import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { AlertComponent } from './alert/alert.component';
import { PageChangeComponent } from './page-change/page-change.component';
import { ConfirmModalComponent } from './confirm/confirm-modal.component';

@NgModule({
  declarations: [AlertComponent, PageChangeComponent, ConfirmModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    // NgbToastModule,
    // NgbDropdownModule,
    NgbAlertModule,
    // NgbProgressbarModule,
    // NgbTooltipModule,
  ],
  exports: [
    // FormsModule,
    // HeaderComponent,
    // ToastComponent,
    AlertComponent,
    PageChangeComponent,
    // ChipsComponent,
    // UploadComponent,
    // NgbTooltipModule,
    ConfirmModalComponent,
  ],
})
export class StorageCommonModule {}
