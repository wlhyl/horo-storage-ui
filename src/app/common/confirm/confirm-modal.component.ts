import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">确认删除</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="no()"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="no()">取消</button>
      <button type="button" class="btn btn-danger" (click)="yes()">确认删除</button>
    </div>
  `,
  standalone: false
})
export class ConfirmModalComponent implements OnInit {
  @Input() message: string = '确定要删除此记录吗？';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  yes() {
    this.activeModal.close(true);
  }

  no() {
    this.activeModal.dismiss(false);
  }
}
