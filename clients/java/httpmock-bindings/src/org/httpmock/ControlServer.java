package org.httpmock;

import net.sf.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ControlServer {
    private final String serversURL;
    private final HttpMock httpMock;

    public static ControlServer at(String url) {
        HttpMock httpMock = new HttpMock();
        return new ControlServer(getServersURL(httpMock, url), httpMock);
    }

    ControlServer(String serversURL, HttpMock httpMock) {
        this.serversURL = serversURL;
        this.httpMock = httpMock;
    }

    public StubServer setupPort(int port) {
        HttpResponse response = httpMock.post(serversURL, jsonForPort(port));
        response.assertStatusIs(201);

        Hypermedia links = new Hypermedia(response.getBodyAsJSONObject().getJSONArray("links"));
        return new StubServer(httpMock,
                links.getURLForRel(Hypermedia.SERVER_REL),
                links.getURLForRel(Hypermedia.REQUESTS_REL),
                links.getURLForRel(Hypermedia.STUBS_REL));
    }

    private JSONObject jsonForPort(int port) {
        Map<String, Integer> map = new HashMap<String, Integer>();
        map.put("port", port);
        return JSONObject.fromObject(map);
    }

    private static String getServersURL(HttpMock httpMock, String url) {
        JSONObject response = httpMock.get(url).getBodyAsJSONObject();
        Hypermedia links = new Hypermedia(response.getJSONArray("links"));
        return links.getURLForRel(Hypermedia.SERVERS_REL);
    }
}
