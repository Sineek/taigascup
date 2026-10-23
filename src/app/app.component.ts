import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GeneratorControlsComponent } from './components/generator-controls/generator-controls.component';
import { DeckCalculatorComponent } from './components/deck-calculator/deck-calculator.component';
import { ScoringAdminComponent } from './components/scoring-admin/scoring-admin.component';
import { TournamentComponent } from './components/tournament/tournament.component';
import { ProxyComponent } from './components/proxy/proxy.component';
import { PostPreviewComponent } from './components/post-preview/post-preview.component';
import { createInitialState, GeneratorState, WheelLeaderState } from './models/post-generator.model';
import { LeaderCatalogService } from './services/leader-catalog.service';
import { PostRendererService } from './services/post-renderer.service';

type Page = 'home' | 'generator' | 'calculator' | 'tournament' | 'admin' | 'proxy';

interface StoredTournamentParticipant {
  id: number;
  nick: string;
  deck: string;
  wins: number;
  losses: number;
  byes: number;
}

interface StoredTournamentMatch {
  player1Id: number;
  player2Id: number | null;
}

interface StoredTournamentState {
  participants: StoredTournamentParticipant[];
  rounds: Array<{ matches: StoredTournamentMatch[] }>;
  status: 'registration' | 'running' | 'finished';
}

const TOURNAMENT_STORAGE_KEY = 'taigas-cup-tournament-v1';
const WHEEL_ADJUSTMENTS_STORAGE_KEY = 'taigas-cup-wheel-adjustments-v1';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GeneratorControlsComponent, DeckCalculatorComponent, ScoringAdminComponent, TournamentComponent, ProxyComponent, PostPreviewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild(PostPreviewComponent) preview?: PostPreviewComponent;

  page: Page = this.pageFromHash();
  state: GeneratorState = createInitialState();
  fontDetected: boolean | null = null;
  private importedTournament = '';
  private wheelAdjustmentsSaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly leaderCatalog: LeaderCatalogService,
    private readonly renderer: PostRendererService,
  ) {}

  ngOnInit(): void {
    if (this.page === 'generator') {
      void this.importTournamentTop4();
    }
  }

  @HostListener('window:hashchange')
  onHashChange(): void {
    this.page = this.pageFromHash();
    if (this.page === 'generator') {
      void this.importTournamentTop4();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!document.fonts) {
      this.fontDetected = false;
      return;
    }

    await document.fonts.ready;
    this.fontDetected = document.fonts.check('72px "VAG Local"');
  }

  updateState(state: GeneratorState): void {
    this.state = state;
    if (this.wheelAdjustmentsSaveTimer !== null) {
      clearTimeout(this.wheelAdjustmentsSaveTimer);
    }
    this.wheelAdjustmentsSaveTimer = setTimeout(() => {
      const adjustments = this.state.wheelLeaders.map(({ id, zoom, x, y }) => ({ id, zoom, x, y }));
      localStorage.setItem(WHEEL_ADJUSTMENTS_STORAGE_KEY, JSON.stringify(adjustments));
      this.wheelAdjustmentsSaveTimer = null;
    }, 150);
  }

  downloadTop3(): void {
    this.preview?.downloadTop3();
  }

  downloadWheel(): void {
    this.preview?.downloadWheel();
  }

  downloadBoth(): void {
    this.preview?.downloadBoth();
  }

  private async importTournamentTop4(): Promise<void> {
    const saved = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
    if (!saved || saved === this.importedTournament) return;

    try {
      const tournament = JSON.parse(saved) as StoredTournamentState;
      if (tournament.status !== 'finished' || tournament.participants.length === 0) return;

      const participantById = new Map(
        tournament.participants.map((participant) => [participant.id, participant]),
      );
      const buchholz = (participantId: number): number =>
        tournament.rounds.reduce((total, round) => total + round.matches.reduce((roundTotal, match) => {
          if (match.player2Id === null) return roundTotal;
          if (match.player1Id !== participantId && match.player2Id !== participantId) return roundTotal;
          const opponentId = match.player1Id === participantId ? match.player2Id : match.player1Id;
          return roundTotal + (participantById.get(opponentId)?.wins ?? 0);
        }, 0), 0);

      const standings = [...tournament.participants]
        .sort((a, b) =>
          b.wins - a.wins ||
          buchholz(b.id) - buchholz(a.id) ||
          a.losses - b.losses ||
          a.byes - b.byes ||
          a.nick.localeCompare(b.nick),
        );
      const leaders = await firstValueFrom(this.leaderCatalog.getLeaders());
      const leaderByCode = new Map(leaders.map((leader) => [leader.code.toUpperCase(), leader]));

      const top4Standings = standings.slice(0, 4);
      const top4 = await Promise.all(this.state.top4.map(async (rank, index) => {
        const participant = top4Standings[index];
        if (!participant) return rank;
        const leader = leaderByCode.get(participant.deck.trim().toUpperCase());
        let image: HTMLImageElement | null = null;
        if (leader) {
          try {
            image = await this.renderer.imageFromSrc(leader.image);
          } catch {
            image = null;
          }
        }
        return {
          ...rank,
          nick: participant.nick,
          img: image,
          imageName: image ? `${participant.deck.trim().toUpperCase()} — ${leader?.name}` : null,
          zoom: 100,
          x: 0,
          y: 0,
        };
      }));

      const savedAdjustments = this.loadWheelAdjustments();
      const groups = standings.reduce<Array<{ code: string; count: number }>>((result, participant) => {
        const code = participant.deck.trim().toUpperCase();
        const existing = result.find((group) => group.code === code);
        if (existing) {
          existing.count += 1;
        } else {
          result.push({ code, count: 1 });
        }
        return result;
      }, []);
      const wheelLeaders: WheelLeaderState[] = await Promise.all(groups.map(async ({ code, count }) => {
        const leader = leaderByCode.get(code);
        const id = code;
        const adjustment = savedAdjustments.get(id);
        let img: HTMLImageElement | null = null;
        if (leader) {
          try {
            img = await this.renderer.imageFromSrc(leader.image);
          } catch {
            img = null;
          }
        }
        return {
          id,
          code,
          name: leader?.name ?? code,
          count,
          img,
          zoom: adjustment?.zoom ?? 100,
          x: adjustment?.x ?? 0,
          y: adjustment?.y ?? 0,
        };
      }));

      this.state = { ...this.state, top4, wheelLeaders };
      this.importedTournament = saved;
    } catch {
      // Ignore malformed legacy storage and keep the generator editable.
    }
  }

  private loadWheelAdjustments(): Map<string, { zoom: number; x: number; y: number }> {
    try {
      const parsed = JSON.parse(localStorage.getItem(WHEEL_ADJUSTMENTS_STORAGE_KEY) ?? '[]') as
        Array<{ id: string; zoom: number; x: number; y: number }>;
      return new Map(parsed.map(({ id, zoom, x, y }) => [id, { zoom, x, y }]));
    } catch {
      return new Map();
    }
  }

  private pageFromHash(): Page {
    switch (window.location.hash) {
      case '#/gerador':
        return 'generator';
      case '#/calculadora':
        return 'calculator';
      case '#/administrativo':
        return 'admin';
      case '#/torneio':
        return 'tournament';
      case '#/proxy':
        return 'proxy';
      default:
        return 'home';
    }
  }
}

