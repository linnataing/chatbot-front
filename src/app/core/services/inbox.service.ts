import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Inbox } from '@model/inbox.model';
import { ApiPaginationService } from '@core/services/api-pagination.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InboxService extends ApiPaginationService<Inbox> {

  constructor(private _http: HttpClient, private _r: Router) {
    super(_http, '/inbox', _r);
  }

  public validate(inbox: Inbox): Observable<Inbox> {
    this._processing$.next(true);
    return this._http.post<Inbox>(`${this._url}/${inbox.id}/validate`, {}).pipe(
      tap(() => {
        this.deleteToEntityArray(inbox);
      }),
      finalize(() => {
        this._processing$.next(false);
      }));
  }
}
