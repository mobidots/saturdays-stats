import * as Math from "mathjs";

export class StatService {
  public static calculateStats(csvStats: CSVStat[]): Stat[] {
    const stats: Stat[] = [];

    // Parse csv-stat to stat
    for (const csvStat of csvStats) {
      const existingStat = stats.find((stat) => stat.name === csvStat.Name);

      if (existingStat) {
        existingStat.gp = existingStat.gp + 1;
        existingStat.tMoV = Math.evaluate(
          `${existingStat.tMoV} + ${csvStat.RD}`
        );
      } else {
        const newStat: Stat = {
          name: csvStat.Name,
          gp: 1,
          tMoV: Number(csvStat.RD),
        };
        stats.push(newStat);
      }
    }

    // Calculate AMoV
    for (const stat of stats) {
      stat.aMoV = Math.round(stat.tMoV / stat.gp, 2);
    }

    // Sort by AMoV and set ranking
    stats.sort((a, b) => b.aMoV - a.aMoV);
    let rank = 1;
    for (let i = 0; i < stats.length; i++) {
      if (i > 0 && stats[i - 1].aMoV === stats[i].aMoV) {
        stats[i].rank = stats[i - 1].rank;
      } else {
        stats[i].rank = rank;
      }

      rank++;
    }

    return stats;
  }

  public static pickTeams(
    players: string[],
    stats: Stat[]
  ): [string[], string[]] {
    const teamPlayers = [];

    for (const stat of stats) {
      const teamPlayer = players.find(
        (player) => player.toLowerCase() === stat.name.toLowerCase()
      );

      if (teamPlayer) {
        teamPlayers.push(stat.name);
      }
    }

    const team1Players = [];
    const team2Players = [];

    let addToTeam1 = true;
    for (const teamPlayer of teamPlayers) {
      if (addToTeam1) {
        team1Players.push(teamPlayer);
      } else {
        team2Players.push(teamPlayer);
      }
      addToTeam1 = !addToTeam1;
    }

    return [team1Players, team2Players];
  }
}
