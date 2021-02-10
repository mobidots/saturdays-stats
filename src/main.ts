import express from "express";
import favicon from 'serve-favicon';
import fs from "fs";
import csvParser from "csv-parser";
import { StatService } from "./service/stat-service";
import bodyParser from "body-parser";

const app = express();
app.use(favicon('public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "views");

const port = process.env.PORT || 8080;

let stats: Stat[] = [];
getStats().then((s) => {
  stats = s
})

app.get("/", async (req, res) => {
  let team1Players: string[] = [];
  let team2Players: string[] = [];

  res.render("home.ejs", {
    stats,
    team1Players,
    team2Players,
  });
});

app.post("/", async (req, res) => {
  let team1Players: string[] = [];
  let team2Players: string[] = [];

  if (req && req.body) {
    const players = Object.keys(req.body)
    console.log(players);

    if (players.length) {
      const teamPlayers = StatService.pickTeams(players, stats);
      team1Players = teamPlayers[0];
      team2Players = teamPlayers[1];
    }
  }

  res.render("home.ejs", {
    stats,
    team1Players,
    team2Players,
  });
});

async function getStats(): Promise<Stat[]> {
  let csvFiles: CSVFile[] = [];

  const files = fs.readdirSync("stats");

  for (const fileName of files) {
    const csvStats = await readStatsFromFile(`stats/${fileName}`);
    csvFiles.push({csvStats});
  }

  return StatService.calculateStats(csvFiles);
}

async function readStatsFromFile(filePath: string): Promise<CSVStat[]> {
  const stats: CSVStat[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (stat: CSVStat) => {
        stats.push(stat);
      })
      .on("end", () => {
        resolve(stats);
      });
  });
}

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
