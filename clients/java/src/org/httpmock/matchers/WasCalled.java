package org.httpmock.matchers;

import org.hamcrest.Description;
import org.httpmock.StubRequest;
import org.httpmock.StubServer;
import org.junit.internal.matchers.TypeSafeMatcher;

import java.util.List;
import java.util.Map;

public class WasCalled extends TypeSafeMatcher<StubServer> {
    private final Expectation expectation;
    private List<StubRequest> stubRequests;

    public static WasCalled wasCalled(String requestMethod, String endpoint) {
        return new WasCalled(requestMethod, endpoint);
    }

    public WasCalled(String requestMethod, String endpoint) {
        expectation = new Expectation(requestMethod, endpoint);
    }

    public WasCalled withHeader(String key, String value) {
        expectation.addHeader(key, value);
        return this;
    }

    public WasCalled withBody(String body) {
        expectation.matchBody(body);
        return this;
    }

    public WasCalled withBodyContaining(String substring) {
        expectation.matchBodySubstring(substring);
        return this;
    }

    @Override
    public boolean matchesSafely(StubServer stub) {
        stubRequests = stub.getRequests();

        for (StubRequest request : stubRequests) {
            if (expectation.matches(request)) {
                return true;
            }
        }
        return false;
    }

    public void describeTo(Description description) {
        description.appendText(String.format("No request matching %s",
                descriptionOf(expectation.getRequestMethod(), expectation.getPath(),
                              expectation.getHeaders(), "")));
        
        for (StubRequest request : stubRequests) {
            description.appendText("\n\t" + descriptionOf(
                    request.getRequestMethod(), request.getPath(),
                    request.getHeaders(), request.getBody()));
        }
    }

    private String descriptionOf(String requestMethod, String path, Map<String, String> headers, String body) {
        if (body == null) {
            body = "";
        }
        return String.format("%s %s {%s} %s", requestMethod, path, descriptionOf(headers), body).trim();
    }

    private String descriptionOf(Map<String, String> headers) {
        String result = "";
        for (Map.Entry<String, String> header : headers.entrySet()) {
            if (result.length() > 0) {
                result += ", ";
            }
            result += descriptionOf(header);
        }
        return result;
    }

    private String descriptionOf(Map.Entry<String, String> header) {
        return String.format("%s: %s", header.getKey(), header.getValue());
    }
}
