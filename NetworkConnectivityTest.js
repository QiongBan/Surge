let $ = {
𝐁𝐢𝐥𝐢:'https://www.bilibili.com',
𝐁𝐚𝐢𝐝𝐮:'https://www.baidu.com',
𝐘𝐨𝐮𝐓𝐮𝐛𝐞:'https://www.youtube.com/',
𝐆𝐨𝐨𝐠𝐥𝐞:'https://www.google.com/generate_204',
𝐆𝐢𝐭𝐡𝐮𝐛:'https://www.github.com'
}

!(async () => {
await Promise.all([http($.𝐁𝐚𝐢𝐝𝐮),http($.𝐁𝐢𝐥𝐢),http($.𝐆𝐢𝐭𝐡𝐮𝐛),http($.𝐆𝐨𝐨𝐠𝐥𝐞),http($.𝐘𝐨𝐮𝐓𝐮𝐛𝐞)]).then((x)=>{
	$done({
    title: '𝐍𝐞𝐭𝐰𝐨𝐫𝐤 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐯𝐢𝐭𝐲 𝐓𝐞𝐬𝐭',
    content: x.join('\n'),
    icon: 'timer',
    'icon-color': '#002133',
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post(req, (err, resp, data) => {
            r(req.split(".")[1]+ '\xa0\xa0\xa0\xa0\xa0\t: ' + (Date.now() - time)+' ms');
        });
    });
}