export default async function handler(req, res) {
    // استقبال الـ ID من الرابط
    const { id } = req.query;
    const compId = id || 7;

    // الرابط المباشر
    const url = `https://webapi.365scores.com/web/games/current/?langId=2&timezoneId=21&userCountryId=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.365scores.com/',
                'Origin': 'https://www.365scores.com',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.games) {
            return res.status(200).json([]);
        }

        const filtered = data.games
            .filter(game => game.competitionId == compId)
            .map(game => ({
                comp_name: game.competitionDisplayName,
                home_team: game.comps[0].name,
                home_logo: `https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:80/v1/Competitors/${game.comps[0].id}`,
                away_team: game.comps[1].name,
                away_logo: `https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:80/v1/Competitors/${game.comps[1].id}`,
                score_home: game.comps[0].score ?? 0,
                score_away: game.comps[1].score ?? 0,
                time: game.startTime,
                status: game.statusText
            }));

        // إعدادات الـ CORS للسماح لبلوجر بالوصول
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.status(200).json(filtered);

    } catch (error) {
        console.error("Vercel Error:", error.message);
        res.status(500).json({ 
            error: "Failed to fetch matches", 
            details: error.message 
        });
    }
}
