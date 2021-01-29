import express from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { StatService } from './service/stat-service';

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

const port = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  let csvStats: CSVStat[] = [];

  const files = fs.readdirSync('stats');

  for (const fileName of files) {
    const fileStats = await readStatsFromFile(`stats/${fileName}`);
    csvStats = csvStats.concat(fileStats);
  };

  const stats = StatService.calculateStats(csvStats);

  res.render('home.ejs', {
    stats
  });
});

async function readStatsFromFile(filePath: string): Promise<CSVStat[]> {
  const stats: CSVStat[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (stat: CSVStat) => {
      stats.push(stat);
    })
    .on('end', () => {
      resolve(stats);
    });
  });
}

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
