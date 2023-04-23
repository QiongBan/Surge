;(async () => {



let params = getParams($argument)
//获取根节点名
let proxy = await httpAPI("/v1/policy_groups");
let allGroup = [];
for (var key in proxy){
   allGroup.push(key)
    }
let group = params.group
let rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(group)+"")).policy;
while(allGroup.includes(rootName)==true){
	rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

$httpClient.get('http://ip-api.com/json/?lang=en', function (error, response, data) {
    const jsonData = JSON.parse(data);
    $done({
      title:rootName,
      content:
		`𝐑𝐞𝐠𝐢𝐨𝐧: ${jsonData.country} - ${jsonData.city}\n`+
        `𝐂𝐚𝐫𝐫𝐢𝐞𝐫: ${jsonData.isp}\n` +
		`𝐃𝐚𝐭𝐚 𝐂𝐞𝐧𝐭𝐞𝐫: ${jsonData.org}` +
		`𝐈𝐏 𝐀𝐝𝐝𝐫.: ${jsonData.query}`,
      icon: params.icon,
		  "icon-color":params.color
    });
  });

})();


function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
};

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}