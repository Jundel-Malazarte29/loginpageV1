try {
    (function(w, d) {
        zaraz.debug = (eT="")=>{
            document.cookie = `zarazDebug=${eT}; path=/`;
            location.reload()
        }
        ;
        window.zaraz._al = function(eh, ei, ej) {
            w.zaraz.listeners.push({
                item: eh,
                type: ei,
                callback: ej
            });
            eh.addEventListener(ei, ej)
        }
        ;
        zaraz.preview = (et="")=>{
            document.cookie = `zarazPreview=${et}; path=/`;
            location.reload()
        }
        ;
        zaraz.i = function(ek) {
            const el = d.createElement("div");
            el.innerHTML = unescape(ek);
            const em = el.querySelectorAll("script");
            for (let en = 0; en < em.length; en++) {
                const eo = d.createElement("script");
                em[en].innerHTML && (eo.innerHTML = em[en].innerHTML);
                for (const ep of em[en].attributes)
                    eo.setAttribute(ep.name, ep.value);
                d.head.appendChild(eo);
                em[en].remove()
            }
            d.body.appendChild(el)
        }
        ;
        zaraz.f = async function(eq, er) {
            const es = {
                credentials: "include",
                keepalive: !0,
                mode: "no-cors"
            };
            if (er) {
                es.method = "POST";
                es.body = new URLSearchParams(er);
                es.headers = {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
            return await fetch(eq, es)
        }
        ;
        window.zaraz._p = async D=>new Promise((E=>{
            if (D) {
                D.e && D.e.forEach((F=>{
                    try {
                        new Function(F)()
                    } catch (G) {
                        console.error(`Error executing script: ${F}\n`, G)
                    }
                }
                ));
                Promise.allSettled((D.f || []).map((H=>fetch(H[0], H[1]))))
            }
            E()
        }
        ));
        zaraz.pageVariables = {};
        zaraz.__zcl = zaraz.__zcl || {};
        zaraz.track = async function(eu, ev, ew) {
            return new Promise(((ex,ey)=>{
                const ez = {
                    name: eu,
                    data: {}
                };
                for (const eA of [localStorage, sessionStorage])
                    Object.keys(eA || {}).filter((eC=>eC.startsWith("_zaraz_"))).forEach((eB=>{
                        try {
                            ez.data[eB.slice(7)] = JSON.parse(eA.getItem(eB))
                        } catch {
                            ez.data[eB.slice(7)] = eA.getItem(eB)
                        }
                    }
                    ));
                Object.keys(zaraz.pageVariables).forEach((eD=>ez.data[eD] = JSON.parse(zaraz.pageVariables[eD])));
                Object.keys(zaraz.__zcl).forEach((eE=>ez.data[`__zcl_${eE}`] = zaraz.__zcl[eE]));
                ez.data.__zarazMCListeners = zaraz.__zarazMCListeners;
                //
                ez.data = {
                    ...ez.data,
                    ...ev
                };
                ez.zarazData = zarazData;
                fetch("/cdn-cgi/zaraz/t", {
                    credentials: "include",
                    keepalive: !0,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(ez)
                }).catch((()=>{
                    //
                    return fetch("/cdn-cgi/zaraz/t", {
                        credentials: "include",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(ez)
                    })
                }
                )).then((function(eG) {
                    zarazData._let = (new Date).getTime();
                    eG.ok || ey();
                    return 204 !== eG.status && eG.json()
                }
                )).then((async eF=>{
                    await zaraz._p(eF);
                    "function" == typeof ew && ew()
                }
                )).finally((()=>ex()))
            }
            ))
        }
        ;
        zaraz.set = function(eH, eI, eJ) {
            try {
                eI = JSON.stringify(eI)
            } catch (eK) {
                return
            }
            prefixedKey = "_zaraz_" + eH;
            sessionStorage && sessionStorage.removeItem(prefixedKey);
            localStorage && localStorage.removeItem(prefixedKey);
            delete zaraz.pageVariables[eH];
            if (void 0 !== eI) {
                eJ && "session" == eJ.scope ? sessionStorage && sessionStorage.setItem(prefixedKey, eI) : eJ && "page" == eJ.scope ? zaraz.pageVariables[eH] = eI : localStorage && localStorage.setItem(prefixedKey, eI);
                zaraz.__watchVar = {
                    key: eH,
                    value: eI
                }
            }
        }
        ;
        for (const {m: eL, a: eM} of zarazData.q.filter((({m: eN})=>["debug", "set"].includes(eN))))
            zaraz[eL](...eM);
        for (const {m: eO, a: eP} of zaraz.q)
            zaraz[eO](...eP);
        delete zaraz.q;
        delete zarazData.q;
        zaraz.spaPageview = ()=>{
            zarazData.l = d.location.href;
            zarazData.t = d.title;
            zaraz.pageVariables = {};
            zaraz.__zarazMCListeners = {};
            zaraz.track("__zarazSPA")
        }
        ;
        zaraz.fulfilTrigger = function(dH, dI, dJ, dK) {
            zaraz.__zarazTriggerMap || (zaraz.__zarazTriggerMap = {});
            zaraz.__zarazTriggerMap[dH] || (zaraz.__zarazTriggerMap[dH] = "");
            zaraz.__zarazTriggerMap[dH] += "*" + dI + "*";
            zaraz.track("__zarazEmpty", {
                ...dJ,
                __zarazClientTriggers: zaraz.__zarazTriggerMap[dH]
            }, dK)
        }
        ;
        zaraz._processDataLayer = dc=>{
            for (const dd of Object.entries(dc))
                zaraz.set(dd[0], dd[1], {
                    scope: "page"
                });
            if (dc.event) {
                if (zarazData.dataLayerIgnore && zarazData.dataLayerIgnore.includes(dc.event))
                    return;
                let de = {};
                for (let df of dataLayer.slice(0, dataLayer.indexOf(dc) + 1))
                    de = {
                        ...de,
                        ...df
                    };
                delete de.event;
                dc.event.startsWith("gtm.") || zaraz.track(dc.event, de)
            }
        }
        ;
        window.dataLayer = w.dataLayer || [];
        const db = w.dataLayer.push;
        Object.defineProperty(w.dataLayer, "push", {
            configurable: !0,
            enumerable: !1,
            writable: !0,
            value: function(...dg) {
                let dh = db.apply(this, dg);
                zaraz._processDataLayer(dg[0]);
                return dh
            }
        });
        dataLayer.forEach((di=>zaraz._processDataLayer(di)));
        zaraz._cts = ()=>{
            zaraz._timeouts && zaraz._timeouts.forEach((dj=>clearTimeout(dj)));
            zaraz._timeouts = []
        }
        ;
        zaraz._rl = function() {
            w.zaraz.listeners && w.zaraz.listeners.forEach((dk=>dk.item.removeEventListener(dk.type, dk.callback)));
            window.zaraz.listeners = []
        }
        ;
        history.pushState = function() {
            try {
                zaraz._rl();
                zaraz._cts && zaraz._cts()
            } finally {
                History.prototype.pushState.apply(history, arguments);
                setTimeout(zaraz.spaPageview, 100)
            }
        }
        ;
        history.replaceState = function() {
            try {
                zaraz._rl();
                zaraz._cts && zaraz._cts()
            } finally {
                History.prototype.replaceState.apply(history, arguments);
                setTimeout(zaraz.spaPageview, 100)
            }
        }
        ;
        zaraz._c = cC=>{
            const {event: cD, ...cE} = cC;
            zaraz.track(cD, {
                ...cE,
                __zarazClientEvent: !0
            })
        }
        ;
        zaraz._syncedAttributes = ["altKey", "clientX", "clientY", "pageX", "pageY", "button"];
        zaraz.__zcl.track = !0;
        d.addEventListener("visibilitychange", (I=>{
            zaraz._c({
                event: "visibilityChange",
                visibilityChange: [{
                    state: d.visibilityState,
                    timestamp: (new Date).getTime()
                }]
            }, 1)
        }
        ));
        zaraz.__zcl.visibilityChange = !0;
        zaraz.__zarazMCListeners = {
            "google-analytics_v4_20ac": ["visibilityChange"]
        };
        zaraz._p({
            "e": ["(function(w,d){w.zarazData.executed.push(\"Pageview\");})(window,document)"],
            "f": [["https://stats.g.doubleclick.net/g/collect?t=dc&aip=1&_r=3&v=1&_v=j86&tid=G-SEKJ4E9T4H&cid=3ad730b3-a900-408f-a208-1eb7eb00689a&_u=KGDAAEADQAAAAC%7E&z=505234881", {}]]
        })
    }
    )(window, document)
} catch (e) {
    throw fetch("/cdn-cgi/zaraz/t"),
    e;
}
