import express from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  const stats: any[] = [];

  fs.createReadStream('public/stats.csv')
    .pipe(csvParser())
    .on('data', data => stats.push(data))
    .on('end', () => {
      res.render('home.ejs', {
        stats
      });
    });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
