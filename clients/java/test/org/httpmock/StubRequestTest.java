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
    public void shouldRetrieveHeaders() {
        StubRequest request = requestFrom("{'headers': {'one': '1', 'two': '2'}}");

        Map<String, String> headers = request.getHeaders();

        assertEquals(2, headers.size());
        assertEquals("1", headers.get("one"));
        assertEquals("2", headers.get("two"));
    }

    @Test
    public void shouldRetrieveBody() {
        StubRequest request = requestFrom("{'body': 'test'}");
        assertEquals("test", request.getBody());
    }

    private StubRequest requestFrom(String json) {
        return new StubRequest(JSONObject.fromObject(json));
    }
}
