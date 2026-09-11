import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { ImageLibraryManifest } from '../models/image-library.model';

@Injectable({ providedIn: 'root' })
export class ImageLibraryService {
  private manifest$?: Observable<ImageLibraryManifest>;

  constructor(private readonly http: HttpClient) {}

  getManifest(): Observable<ImageLibraryManifest> {
    this.manifest$ ??= this.http
      .get<ImageLibraryManifest>('assets/library/library.json')
      .pipe(
        catchError(() =>
          of({
            generatedAt: '',
            wheels: [],
            backgrounds: [],
          }),
        ),
        shareReplay(1),
      );

    return this.manifest$;
  }
}
