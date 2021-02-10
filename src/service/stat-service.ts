import * as Math from "mathjs";

export class StatService {
  public static calculateStats(csvFiles: CSVFile[]): Stat[] {
    const stats: Stat[] = [];
    let upToLastGameStats: Stat[] = [];

    // Parse csv-stat to stat
    for (let i = 0; i < csvFiles.length; i++) {
      for (const csvStat of csvFiles[i].csvStats) {
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

      // Save a snapshot of all games minus the last game
      if (i > 0 && i === csvFiles.length - 2) {
        upToLastGameStats = [];
        stats.forEach((stat) =>
          upToLastGameStats.push(Object.assign({}, stat))
        );
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
        stats[i].rank = i + 1;
      }
    }

    // Do the same for the snapshot
    for (const stat of upToLastGameStats) {
      stat.aMoV = Math.round(stat.tMoV / stat.gp, 2);
      stat.aCS = Math.round(stat.tCS / stat.gp, 2);
      stat.bOT = Math.round((stat.aCS * (13 + stat.aMoV)) / 10, 2);
    }
    upToLastGameStats.sort((a, b) => b.bOT - a.bOT);
    for (let i = 0; i < upToLastGameStats.length; i++) {
      if (i > 0 && upToLastGameStats[i - 1].bOT === upToLastGameStats[i].bOT) {
        upToLastGameStats[i].rank = upToLastGameStats[i - 1].rank;
      } else {
        upToLastGameStats[i].rank = i + 1;
      }
    }

    // Calculate stat difference and set text
    for (const stat of stats) {
      const upToLastGameStat = upToLastGameStats.find(
        (x) => x.name === stat.name
      );

      if (upToLastGameStat && upToLastGameStat.gp !== stat.gp) {
        stat.difference = {
          gp: Math.round(stat.gp - upToLastGameStat.gp, 2),
          aMoV: Math.round(stat.aMoV - upToLastGameStat.aMoV, 2),
          aCS: Math.round(stat.aCS - upToLastGameStat.aCS, 2),
          bOT: Math.round(stat.bOT - upToLastGameStat.bOT, 2),
          rank: Math.round(upToLastGameStat.rank - stat.rank, 2),
        };

        stat.difference.gpText = this.getDifferenceText(stat.difference.gp);
        stat.difference.aMoVText = this.getDifferenceText(stat.difference.aMoV);
        stat.difference.aCSText = this.getDifferenceText(stat.difference.aCS);
        stat.difference.bOTText = this.getDifferenceText(stat.difference.bOT);
        stat.difference.rankText = this.getDifferenceText(stat.difference.rank);
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

  private static getDifferenceText(num: number): string {
    if (num === 0) {
      return "";
    } else if (num > 0) {
      return '<span class="green-text">&#8593;' + Math.abs(num) + "</span>";
    } else {
      return '<span class="red-text">&#8595;' + Math.abs(num) + "</span>";
    }
  }
}
