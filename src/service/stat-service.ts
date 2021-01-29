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
      if (i > 0 && stats[i - 1].aMoV !== stats[i].aMoV) {
        rank = i+1;
      }

      stats[i].rank = rank;
    }

    return stats;
  }
}
