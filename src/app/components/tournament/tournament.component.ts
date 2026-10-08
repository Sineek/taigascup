import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Participant {
  id: number;
  nick: string;
  deck: string;
  wins: number;
  losses: number;
  byes: number;
}

interface SavedParticipant extends Omit<Participant, 'deck'> {
  deck?: string;
  leader?: string;
}

interface Match {
  id: number;
  player1Id: number;
  player2Id: number | null;
  winnerId: number | null;
}

interface Round {
  number: number;
  matches: Match[];
}

interface TournamentState {
  participants: Participant[];
  rounds: Round[];
  status: 'registration' | 'running' | 'finished';
  championId: number | null;
  nextParticipantId: number;
  nextMatchId: number;
}

const STORAGE_KEY = 'taigas-cup-tournament-v1';

function initialState(): TournamentState {
  return {
    participants: [],
    rounds: [],
    status: 'registration',
    championId: null,
    nextParticipantId: 1,
    nextMatchId: 1,
  };
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css',
})
export class TournamentComponent {
  state = this.loadState();
  nick = '';
  deck = '';
  error = '';

  get currentRound(): Round | null {
    return this.state.rounds.at(-1) ?? null;
  }

  get champion(): Participant | null {
    return this.participant(this.state.championId);
  }

  get standings(): Participant[] {
    return [...this.state.participants].sort((a, b) => this.compareParticipants(a, b));
  }

  buchholz(participantId: number): number {
    return this.completedRounds().reduce((total, round) => total + round.matches.reduce((roundTotal, match) => {
      if (match.player2Id === null) return roundTotal;
      if (match.player1Id !== participantId && match.player2Id !== participantId) return roundTotal;
      const opponentId = match.player1Id === participantId ? match.player2Id : match.player1Id;
      return roundTotal + (this.participant(opponentId)?.wins ?? 0);
    }, 0), 0);
  }

  addParticipant(): void {
    const nick = this.nick.trim();
    const deck = this.deck.trim();
    if (!nick || !deck) {
      this.error = 'Informe o nick e o deck do participante.';
      return;
    }
    if (this.state.participants.some((participant) => participant.nick.toLocaleLowerCase() === nick.toLocaleLowerCase())) {
      this.error = 'Já existe um participante com esse nick.';
      return;
    }
    if (this.state.status === 'finished') {
      this.error = 'Limpe o torneio antes de iniciar uma nova disputa.';
      return;
    }

    const participant: Participant = {
      id: this.state.nextParticipantId++,
      nick,
      deck,
      wins: 0,
      losses: 0,
      byes: 0,
    };
    this.state.participants.push(participant);

    if (this.state.status === 'running' && this.currentRound) {
      this.addLateParticipantToCurrentRound(participant, this.currentRound);
    }

    this.nick = '';
    this.deck = '';
    this.error = '';
    this.saveState();
  }

  startTournament(): void {
    if (this.state.participants.length < 2) {
      this.error = 'Adicione pelo menos dois participantes.';
      return;
    }
    this.state.status = 'running';
    this.error = '';
    this.createNextRound();
  }

  selectWinner(match: Match, winnerId: number): void {
    if (match.player2Id === null) return;

    const roundIndex = this.state.rounds.findIndex((round) => round.matches.includes(match));
    if (roundIndex < 0 || !this.canEditRound(this.state.rounds[roundIndex])) return;
    if (match.winnerId === winnerId) return;

    const wasCompleted = this.state.rounds[roundIndex].matches.every((item) => item.winnerId !== null);
    const isCurrentRound = roundIndex === this.state.rounds.length - 1;
    match.winnerId = winnerId;

    if (wasCompleted || !isCurrentRound) {
      this.state.rounds = this.state.rounds.slice(0, roundIndex + 1);
      this.recalculateStandings();
      this.advanceAfterCompletedRound();
      return;
    }

    this.saveState();
    if (this.currentRound?.matches.every((item) => item.winnerId !== null)) {
      this.completeCurrentRound();
    }
  }

  canEditRound(round: Round): boolean {
    const roundIndex = this.state.rounds.indexOf(round);
    if (roundIndex < 0) return false;
    return this.state.rounds
      .slice(roundIndex + 1)
      .every((laterRound) => laterRound.matches.some((match) => match.winnerId === null));
  }

  repairCurrentRound(): void {
    if (this.state.status !== 'running' || !this.currentRound) return;
    this.currentRound.matches = this.buildMatches(this.state.participants);
    this.error = '';
    this.saveState();
  }

  clearTournament(): void {
    this.state = initialState();
    this.nick = '';
    this.deck = '';
    this.error = '';
    localStorage.removeItem(STORAGE_KEY);
  }

  participant(id: number | null): Participant | null {
    return id === null ? null : this.state.participants.find((item) => item.id === id) ?? null;
  }

  private addLateParticipantToCurrentRound(participant: Participant, round: Round): void {
    const byeMatch = round.matches.find((match) => match.player2Id === null);
    if (byeMatch) {
      const previousBye = this.participant(byeMatch.player1Id);
      if (previousBye && byeMatch.winnerId === previousBye.id) {
        byeMatch.player2Id = participant.id;
        byeMatch.winnerId = null;
        return;
      }
    }
    round.matches.push({
      id: this.state.nextMatchId++,
      player1Id: participant.id,
      player2Id: null,
      winnerId: participant.id,
    });
  }

  private createNextRound(): void {
    const round: Round = {
      number: this.state.rounds.length + 1,
      matches: this.buildMatches(this.state.participants),
    };
    this.state.rounds.push(round);
    this.saveState();
  }

  private buildMatches(participants: Participant[]): Match[] {
    const pool = this.shuffle([...participants]).sort((a, b) => this.compareParticipants(a, b));
    const matches: Match[] = [];

    if (pool.length % 2 === 1) {
      const minimumByes = Math.min(...pool.map((participant) => participant.byes));
      const byeCandidate = [...pool].reverse().find((participant) => participant.byes === minimumByes)!;
      pool.splice(pool.findIndex((item) => item.id === byeCandidate.id), 1);
      matches.push({
        id: this.state.nextMatchId++,
        player1Id: byeCandidate.id,
        player2Id: null,
        winnerId: byeCandidate.id,
      });
    }

    while (pool.length) {
      const player1 = pool.shift()!;
      let opponentIndex = pool.findIndex((candidate) => !this.havePlayed(player1.id, candidate.id));
      if (opponentIndex < 0) opponentIndex = 0;
      const player2 = pool.splice(opponentIndex, 1)[0];
      matches.push({
        id: this.state.nextMatchId++,
        player1Id: player1.id,
        player2Id: player2.id,
        winnerId: null,
      });
    }
    return matches;
  }

  private completeCurrentRound(): void {
    const round = this.currentRound;
    if (!round) return;

    for (const match of round.matches) {
      const winner = this.participant(match.winnerId);
      if (!winner) continue;
      winner.wins += 1;
      if (match.player2Id === null) {
        winner.byes += 1;
        continue;
      }
      const loserId = match.player1Id === winner.id ? match.player2Id : match.player1Id;
      const loser = this.participant(loserId);
      if (loser) loser.losses += 1;
    }

    this.advanceAfterCompletedRound();
  }

  private advanceAfterCompletedRound(): void {
    const undefeated = this.state.participants.filter((participant) => participant.losses === 0);
    if (undefeated.length === 1) {
      this.state.status = 'finished';
      this.state.championId = undefeated[0].id;
      this.saveState();
      return;
    }
    this.state.status = 'running';
    this.state.championId = null;
    this.createNextRound();
  }

  private recalculateStandings(): void {
    for (const participant of this.state.participants) {
      participant.wins = 0;
      participant.losses = 0;
      participant.byes = 0;
    }

    for (const round of this.state.rounds) {
      for (const match of round.matches) {
        const winner = this.participant(match.winnerId);
        if (!winner) continue;
        winner.wins += 1;
        if (match.player2Id === null) {
          winner.byes += 1;
          continue;
        }
        const loserId = match.player1Id === winner.id ? match.player2Id : match.player1Id;
        const loser = this.participant(loserId);
        if (loser) loser.losses += 1;
      }
    }
  }

  private havePlayed(player1Id: number, player2Id: number): boolean {
    return this.state.rounds.some((round) => round.matches.some((match) =>
      (match.player1Id === player1Id && match.player2Id === player2Id) ||
      (match.player1Id === player2Id && match.player2Id === player1Id),
    ));
  }

  private compareParticipants(a: Participant, b: Participant): number {
    return b.wins - a.wins ||
      this.buchholz(b.id) - this.buchholz(a.id) ||
      a.losses - b.losses ||
      a.byes - b.byes ||
      a.nick.localeCompare(b.nick);
  }

  private comparePairingParticipants(a: Participant, b: Participant): number {
    return b.wins - a.wins ||
      this.buchholz(b.id) - this.buchholz(a.id) ||
      a.losses - b.losses ||
      a.byes - b.byes;
  }

  private completedRounds(): Round[] {
    return this.state.rounds.filter((round) =>
      round.matches.every((match) => match.winnerId !== null),
    );
  }

  private shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1));
      [items[index], items[target]] = [items[target], items[index]];
    }
    return items;
  }

  private loadState(): TournamentState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialState();
      const parsed = JSON.parse(saved) as Omit<TournamentState, 'participants'> & {
        participants: SavedParticipant[];
      };
      return {
        ...parsed,
        participants: parsed.participants.map((participant) => ({
          ...participant,
          deck: participant.deck ?? participant.leader ?? '',
        })),
      };
    } catch {
      return initialState();
    }
  }

  private saveState(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

