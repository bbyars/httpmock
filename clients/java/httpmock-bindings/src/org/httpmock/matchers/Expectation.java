package org.httpmock.matchers;

import org.httpmock.StubRequest;

import java.util.HashMap;
import java.util.Map;

public class Expectation {
    private final String requestMethod;
    private final String path;
    private final Map<String, String> expectedHeaders = new HashMap<String, String>();
    private String body;
    private String bodySubstring;

    public Expectation(String requestMethod, String path) {
        this.requestMethod = requestMethod;
        this.path = path;
    }

    public void addHeader(String key, String value) {
        expectedHeaders.put(key, value);
    }

    public void matchBody(String body) {
        this.body = body;
    }

    public void matchBodySubstring(String text) {
        bodySubstring = text;
    }

    public String getRequestMethod() {
        return requestMethod;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getHeaders() {
        return expectedHeaders;
    }

    public boolean matches(StubRequest request) {
        return request.getRequestMethod().equals(requestMethod)
            && request.getPath().equals(path)
            && headersMatch(request.getRequestHeaders())
            && bodyMatches(request.getRequestBody());
    }

    private boolean headersMatch(Map<String, String> actualHeaders) {
        for (Map.Entry<String, String> header : expectedHeaders.entrySet()) {
            if (!containsHeader(actualHeaders, header)) {
                return false;
            }
        }
        return true;
    }

    private boolean containsHeader(Map<String, String> actualHeaders, Map.Entry<String, String> header) {
        for (String key : actualHeaders.keySet()) {
            if (key.toLowerCase().equals(header.getKey().toLowerCase())) {
                return header.getValue().equals(actualHeaders.get(key));
            }
        }
        return false;
    }

    private boolean bodyMatches(String actualBody) {
        if (body != null) {
            return actualBody.equals(body);
        }
        else if (bodySubstring != null) {
            return actualBody.contains(bodySubstring);
        }
        else {
            return true;
        }
    }
}
