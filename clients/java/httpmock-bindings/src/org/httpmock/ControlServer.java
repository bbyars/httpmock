package org.httpmock;

import net.sf.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ControlServer {
    private final String serversURL;
    private final Http http;

    public static ControlServer at(String url) {
        Http http = new Http();
        return new ControlServer(getServersURL(http, url), http);
    }

    ControlServer(String serversURL, Http http) {
        this.serversURL = serversURL;
        this.http = http;
    }

    public StubServer setupPort(int port) {
        HttpResponse response = http.post(serversURL, jsonForPort(port));
        response.assertStatusIs(201);

        Hypermedia links = new Hypermedia(response.getBodyAsJSONObject().getJSONArray("links"));
        return new StubServer(http,
                links.getURLForRel(Hypermedia.SERVER_REL),
                links.getURLForRel(Hypermedia.REQUESTS_REL),
                links.getURLForRel(Hypermedia.STUBS_REL));
    }

    private JSONObject jsonForPort(int port) {
        Map<String, Integer> map = new HashMap<String, Integer>();
        map.put("port", port);
        return JSONObject.fromObject(map);
    }

    private static String getServersURL(Http http, String url) {
        JSONObject response = http.get(url).getBodyAsJSONObject();
        Hypermedia links = new Hypermedia(response.getJSONArray("links"));
        return links.getURLForRel(Hypermedia.SERVERS_REL);
    }
}
