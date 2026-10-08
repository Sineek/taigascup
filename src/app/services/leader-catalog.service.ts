import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { LeaderCatalog, LeaderCatalogEntry } from '../models/leader-catalog.model';

@Injectable({ providedIn: 'root' })
export class LeaderCatalogService {
  private leaders$?: Observable<LeaderCatalogEntry[]>;

  constructor(private readonly http: HttpClient) {}

  getLeaders(): Observable<LeaderCatalogEntry[]> {
    this.leaders$ ??= this.http
      .get<LeaderCatalog>('assets/tournament/leaders.json')
      .pipe(
        map((catalog) => catalog.leaders),
        catchError(() => of([])),
        shareReplay(1),
      );
    return this.leaders$;
  }
}

