import express from "express";
import fs from "fs";
import csvParser from "csv-parser";
import { StatService } from "./service/stat-service";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "views");

const port = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  const stats = await getStats();
  let team1Players: string[] = [];
  let team2Players: string[] = [];

  res.render("home.ejs", {
    stats,
    team1Players,
    team2Players,
  });
});

app.post("/", async (req, res) => {
  const stats = await getStats();
  let team1Players: string[] = [];
  let team2Players: string[] = [];

  if (req && req.body && req.body["players"]) {
    const players = req.body["players"].split("\r\n");
    console.log(players);
    const teamPlayers = StatService.pickTeams(players, stats);
    team1Players = teamPlayers[0];
    team2Players = teamPlayers[1];
  }

  res.render("home.ejs", {
    stats,
    team1Players,
    team2Players,
  });
});

async function getStats(): Promise<Stat[]> {
  let csvStats: CSVStat[] = [];

  const files = fs.readdirSync("stats");

  for (const fileName of files) {
    const fileStats = await readStatsFromFile(`stats/${fileName}`);
    csvStats = csvStats.concat(fileStats);
  }

  return StatService.calculateStats(csvStats);
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
