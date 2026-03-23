const https = require('https');

export default function handler(req, res) {
    const { id } = req.query;
    const compId = id || 7;
    const url = `https://webapi.365scores.com/web/games/current/?langId=2&timezoneId=21&userCountryId=1`;

    https.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                const filtered = jsonData.games
                    .filter(game => game.competitionId == compId)
                    .map(game => ({
                        comp_name: game.competitionDisplayName,
                        home_team: game.comps[0].name,
                        home_logo: `https://imagecache.365scores.com/image/upload/v1/Competitors/${game.comps[0].id}`,
                        away_team: game.comps[1].name,
                        away_logo: `https://imagecache.365scores.com/image/upload/v1/Competitors/${game.comps[1].id}`,
                        score_home: game.comps[0].score || 0,
                        score_away: game.comps[1].score || 0,
                        time: game.startTime,
                        status: game.statusText
                    }));
                
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.status(200).json(filtered);
            } catch (e) {
                res.status(500).json({ error: "Parsing error" });
            }
        });
    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
}
