const args = argsList(typeof $argument == "string" && $argument || 'region=debug');
args.whitelist = args.whitelist || `[".mwcname.com", ".akadns.", ".akamai.", ".cloud.", ".cdn.", ".yun."]`;
args.key = args.key || 'Rule-Storage';

(async () => {
    const host = $request.hostname.toLowerCase();
    const inHost = $request.listenPort == 6152 && !$request.sourcePort && !$request.processPath && /^[a-z0-9]{10}\.[a-z]+$/.test(host);
    if (['127.0.0.1', '0.0.0.0'].filter((v) => [...($request.dnsResult || {}).v4Addresses || []].includes(v)).length) {
        args.matched = false;
        args.region = 'global';
    }
    if (!/\d$|:/.test(host) && host.includes('.') && !inHost) {
        const data = JSON.parse($persistentStore.read(args.key) || '{}');
        const saved_rules = $persistentStore.read(`${args.key}-${args.region}`);
        if (!evalRules(host, saved_rules)) {
            data[args.region] = saveDecision(host, data[args.region]);
            if (data[args.region][host].quantity >= (args.quantity || 10)) {
                const text = [...formatRules(saved_rules), ...formatRules(host)].join('\n');
                delete data[args.region][host];
                $persistentStore.write(text, `${args.key}-${args.region}`)
            }
        }
        return $persistentStore.write(JSON.stringify(data), args.key)
    }
})().catch((e) => $notification.post(args.key, ``, e.message || e))
    .finally(() => $done({ matched: Boolean(args.matched) }));

function saveDecision(host_name, content = {}) {
    const count = [];
    for (const i in content) {
        if (Date.now() - content[i].update_time > 86400000 * (args.cacheDays || 30)) {
            delete content[i];
            continue
        }
        count.push(content[i].update_time);
    }
    if (count.length > (args.cacheNumber || 1000)) {
        const spill = count.sort((x, y) => x - y).slice(0, count.length - (args.cacheNumber || 1000));
        for (const is of spill) {
            for (const ic in content) {
                if (content[ic].update_time === is) {
                    delete content[ic];
                    break
                }
            }
        }
    }
    if (content[host_name]) {
        if (Date.now() - content[host_name].update_time > ((args.interval || 30) * 1000)) {
            content[host_name].update_time = Date.now();
            content[host_name].quantity++;
        }
    } else {
        content[host_name] = { update_time: Date.now(), quantity: 1 }
    }
    return content
}

function evalRules(host_name, rule_list) {
    const host_suffix = host_name.split('.').reverse();
    rule_list = typeof rule_list == 'object' ? rule_list : formatRules(rule_list, 1);
    for (const i in rule_list) {
        if (rule_list[i].startsWith('.') && !rule_list[i].endsWith('.')) {
            const rule_host_suffix = rule_list[i].split('.').reverse().filter((v) => v);
            if (rule_host_suffix.filter((v, i) => host_suffix[i] === v).length === rule_host_suffix.length) {
                return true
            }
        } else if (rule_list[i].startsWith('.') && rule_list[i].endsWith('.')) {
            if (host_name.includes(rule_list[i].slice(1, -1))) {
                return true
            }
        } else if (rule_list[i] === host_name) {
            return true
        }
    }
    return false
}

function formatRules(list, type) {
    return (list || '').replace(/\r|\ |(\/\/|#|;).*/g, '').split('\n').map((v) => {
        if (v.startsWith('DOMAIN,')) { return type ? v.split(",")[1] : v }
        if (v.startsWith('DOMAIN-SUFFIX,')) { return type ? `.${v.split(",")[1]}` : v }
        if (v.startsWith('.')) { return type ? v : `DOMAIN-SUFFIX,${v.slice(1)}` }
        if (v.includes('.')) { return type ? v : `DOMAIN,${v}` }
    }).filter((v) => v);
}

function argsList(data) {
    return Array.from(
        data.split("&")
            .map((i) => i.split("="))
            .map(([k, v]) => [k, decodeURIComponent(v)])
    )
        .reduce((a, [k, v]) => Object.assign(a, { [k]: v }), {})
}