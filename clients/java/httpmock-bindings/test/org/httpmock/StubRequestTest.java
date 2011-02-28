package org.httpmock;

import net.sf.json.JSONObject;
import org.junit.Test;

import java.util.Map;

import static junit.framework.Assert.assertEquals;

public class StubRequestTest {
    @Test
    public void shouldRetrievePath() {
        StubRequest request = requestFrom("{'path': 'test'}");
        assertEquals("test", request.getPath());
    }

    @Test
    public void shouldRetrieveRequestMethod() {
        StubRequest request = requestFrom("{'method': 'POST'}");
        assertEquals("POST", request.getRequestMethod());
    }

    @Test
    public void shouldRetrieveRequestHeaders() {
        StubRequest request = requestFrom("{'request': {'headers': {'one': '1', 'two': '2'}}}");

        Map<String, String> headers = request.getRequestHeaders();

        assertEquals(2, headers.size());
        assertEquals("1", headers.get("one"));
        assertEquals("2", headers.get("two"));
    }

    @Test
    public void shouldRetrieveRequestBody() {
        StubRequest request = requestFrom("{'request': {'body': 'test'}}");
        assertEquals("test", request.getRequestBody());
    }

    @Test
    public void shouldRetrieveResponseCode() {
        StubRequest request = requestFrom("{'response': {'statusCode': 200}}");
        assertEquals(200, request.getResponseCode());
    }

    @Test
    public void shouldRetrieveResponseHeaders() {
        StubRequest request = requestFrom("{'response': {'headers': {'one': '1', 'two': '2'}}}");

        Map<String, String> headers = request.getResponseHeaders();

        assertEquals(2, headers.size());
        assertEquals("1", headers.get("one"));
        assertEquals("2", headers.get("two"));
    }

    @Test
    public void shouldRetrieveResponsetBody() {
        StubRequest request = requestFrom("{'response': {'body': 'test'}}");
        assertEquals("test", request.getResponseBody());
    }

    private StubRequest requestFrom(String json) {
        return new StubRequest(JSONObject.fromObject(json));
    }
}
