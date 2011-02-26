package org.httpmock;

import net.sf.json.JSONObject;

public class Http {
    public HttpResponse get(String url) {
        return new HttpRequest("GET", url)
                .withHeader("Accept", Hypermedia.CONTENT_TYPE)
                .send();
    }

    public HttpResponse post(String url, JSONObject body) {
        return new HttpRequest("POST", url)
                .withHeader("Content-Type", Hypermedia.CONTENT_TYPE)
                .withBody(body.toString())
                .send();
    }

    public HttpResponse delete(String url) {
        return new HttpRequest("DELETE", url).send();
    }
}
