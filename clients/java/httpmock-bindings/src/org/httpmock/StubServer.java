package org.httpmock;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class StubServer {
    private final Http http;
    final String serverURL;
    final String requestsURL;
    final String stubURL;

    StubServer(Http http, String serverURL, String requestsURL, String stubURL) {
        this.http = http;
        this.serverURL = serverURL;
        this.requestsURL = requestsURL;
        this.stubURL = stubURL;
    }

    public List<StubRequest> getRequests() {
        HttpResponse response = http.get(requestsURL);
        response.assertStatusIs(200);
        return collectRequests(response.getBodyAsJSONArray());
    }

    public void close() {
        HttpResponse response = http.delete(serverURL);
        response.assertStatusIs(204);
    }

    private List<StubRequest> collectRequests(JSONArray requests) {
        List<StubRequest> result = new ArrayList<StubRequest>();
        for (Object request : requests) {
            result.add(new StubRequest((JSONObject)request));
        }
        return result;
    }
}
