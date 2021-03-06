import { Component, OnInit } from '@angular/core';
import { IntentService } from '@core/services/intent.service';
import { Observable } from 'rxjs';
import { Intent } from '@model/intent.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { filter } from 'rxjs/operators';
import { PaginationHelper } from '@model/pagination-helper.model';
import { detailInOutAnimation } from '../../shared/components/chatbot-list-item/chatbot-list-item.animation';
import { IntentStatus, IntentStatus_Fr } from '@enum/*';
import { ConfigService } from '@core/services/config.service';

@Component({
  selector: 'app-intent-list',
  templateUrl: './intent-list.component.html',
  styleUrls: ['./intent-list.component.scss'],
  animations: [
    detailInOutAnimation
  ]
})
export class IntentListComponent implements OnInit {

  intents$: Observable<Intent[]>;
  pagination: PaginationHelper;
  loading$: Observable<boolean>;
  intentSelected: string = null;
  intentStatus = IntentStatus;
  intentStatusFr = IntentStatus_Fr;

  constructor(public intentService: IntentService,
              private _configService: ConfigService,
              private _dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.loading$ = this.intentService.loading$;
    this.intents$ = this.intentService.entities$;
    this.pagination = this.intentService.pagination;

    this.intents$.subscribe(intents => {
      this.intentSelected = null;
      if (intents && intents.length === 1 && this.pagination.currentPage <= 1) {
        this.intentSelected = intents[0].id;
      }
    });
  }

  selectIntent(intentId: string) {
    this.intentSelected = (this.intentSelected === intentId) ? null : intentId;
  }

  archiveIntent(intent: Intent) {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Êtes-vous sûr de vouloir archiver la connaissance
<b>${intent.id}${intent.mainQuestion ? ` - "${intent.mainQuestion}"` : ''}</b> ?`
      }
    });

    dialogRef.afterClosed()
      .pipe(filter(r => !!r))
      .subscribe(async () => {
        await this.intentService.delete(intent).subscribe();
        this._configService.getConfig().subscribe();
      });

  }

  isIntentInError(intent: Intent) {
    return intent.knowledges?.length < 1;
  }

}
