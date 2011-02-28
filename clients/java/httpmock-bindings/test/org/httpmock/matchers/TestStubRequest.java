package org.httpmock.matchers;

import org.httpmock.StubRequest;

import java.util.HashMap;
import java.util.Map;

public class TestStubRequest extends StubRequest {
    private final String requestMethod;
    private final String path;
    private Map<String, String> headers = new HashMap<String, String>();
    private String body = "";

    public static TestStubRequest request(String requestMethod, String path) {
        return new TestStubRequest(requestMethod, path);
    }

    public TestStubRequest(String requestMethod, String path) {
        super(null);
        this.requestMethod = requestMethod;
        this.path = path;
    }

    public TestStubRequest withHeader(String key, String value) {
        headers.put(key, value);
        return this;
    }

    public TestStubRequest withBody(String body) {
        this.body = body;
        return this;
    }

    @Override
    public String getRequestMethod() {
        return requestMethod;
    }

    @Override
    public String getPath() {
        return path;
    }

    @Override
    public Map<String, String> getRequestHeaders() {
        return headers;
    }

    @Override
    public String getRequestBody() {
        return body;
    }
}