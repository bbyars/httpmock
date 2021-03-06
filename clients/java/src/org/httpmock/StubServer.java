package org.httpmock;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class StubServer {
    private final HttpMock httpMock;
    final String serverURL;
    final String requestsURL;
    final String stubURL;

    StubServer(HttpMock httpMock, String serverURL, String requestsURL, String stubURL) {
        this.httpMock = httpMock;
        this.serverURL = serverURL;
        this.requestsURL = requestsURL;
        this.stubURL = stubURL;
    }

    public List<StubRequest> getRequests() {
        HttpResponse response = httpMock.get(requestsURL);
        response.assertStatusIs(200);
        return collectRequests(response.getBodyAsJSONArray());
    }

    public Stubber on(String method, String url) {
        Stubber stubber = new Stubber(httpMock, stubURL, url);
        stubber.setRequestMethod(method);
        return stubber;
    }

    public void close() {
        HttpResponse response = httpMock.delete(serverURL);
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
