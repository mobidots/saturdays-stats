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
        existingStat.tCS = Math.evaluate(
          `${existingStat.tCS} + ${csvStat.CS}`
        );
      } else {
        const newStat: Stat = {
          name: csvStat.Name,
          gp: 1,
          tMoV: Number(csvStat.RD),
          tCS: Number(csvStat.CS),
        };
        stats.push(newStat);
      }
    }

    // Calculate AMoV, ACS, and BOT
    for (const stat of stats) {
      stat.aMoV = Math.round(stat.tMoV / stat.gp, 2);
      stat.aCS = Math.round(stat.tCS / stat.gp, 2);
      stat.bOT = Math.round((stat.aCS * (13 + stat.aMoV)) / 10, 2);
    }

    // Sort by BOT and set ranking
    stats.sort((a, b) => b.bOT - a.bOT);
    for (let i = 0; i < stats.length; i++) {
      if (i > 0 && stats[i - 1].bOT === stats[i].bOT) {
        stats[i].rank = stats[i - 1].rank;
      } else {
        stats[i].rank = i+1;
      }
    }

    return stats;
  }

  public static pickTeams(
    players: string[],
    stats: Stat[]
  ): [string[], string[]] {
    const teamPlayers = [];

    for (const stat of stats) {
      const teamPlayer = players.find((player) =>
        player.length > 2
          ? stat.name.toLowerCase().indexOf(player.toLowerCase()) > -1
          : player.toLowerCase() === stat.name.toLowerCase()
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
