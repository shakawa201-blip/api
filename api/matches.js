export default async function handler(req, res) {
    const { id } = req.query;
    const compId = id || 7;

    // الرابط الأصلي
    const targetUrl = `https://webapi.365scores.com/web/games/current/?langId=2&timezoneId=21&userCountryId=1`;
    
    // استخدام Proxy لتخطي حظر Vercel
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        
        // allorigins بيرجع البيانات جوه حقل اسمه contents كـ String
        const data = JSON.parse(proxyData.contents);

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

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(filtered);

    } catch (error) {
        res.status(500).json({ 
            error: "Proxy Fetch Failed", 
            details: error.message 
        });
    }
}
