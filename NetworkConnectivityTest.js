let $ = {
Bilibili:'https://www.bilibili.com',
Baidu:'https://www.baidu.com',
Youtube:'https://www.youtube.com/',
Google:'https://www.google.com/generate_204',
Github:'https://www.github.com'
}

!(async () => {
await Promise.all([http($.Baidu),http($.Biibili),http($.Github),http($.Google),http($.Youtube)]).then((x)=>{
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
            r(req.split(".")[1]+ ':' + (Date.now() - time)+' ms');
        });
    });
}