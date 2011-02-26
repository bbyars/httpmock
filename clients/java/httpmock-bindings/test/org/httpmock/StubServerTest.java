package org.httpmock;

import net.sf.json.JSONArray;
import org.junit.Test;

import java.util.List;

import static junit.framework.Assert.assertEquals;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.*;

public class StubServerTest {
    private final Http http = mock(Http.class);
    private final HttpResponse response = mock(HttpResponse.class);

    @Test
    public void getRequestsShouldGetRequestsURL() {
        when(http.get(anyString())).thenReturn(response);
        when(response.getBodyAsJSONArray()).thenReturn(JSONArray.fromObject("[]"));
        StubServer server = new StubServer(http, "serverURL", "requestsURL", "stubURL");

        server.getRequests();

        verify(http).get("requestsURL");
    }

    @Test
    public void getRequestsShouldAssert200StatusCode() {
        when(http.get(anyString())).thenReturn(response);
        when(response.getBodyAsJSONArray()).thenReturn(JSONArray.fromObject("[]"));        
        StubServer server = new StubServer(http, "serverURL", "requestsURL", "stubURL");

        server.getRequests();

        verify(response).assertStatusIs(200);
    }

    @Test
    public void getRequestsShouldReturnEachArrayElement() {
        when(http.get(anyString())).thenReturn(response);
        when(response.getBodyAsJSONArray()).thenReturn(JSONArray.fromObject("[{}, {}]"));
        StubServer server = new StubServer(http, "serverURL", "requestsURL", "stubURL");

        List<StubRequest> requests = server.getRequests();

        assertEquals(2, requests.size());
    }

    @Test
    public void closeShouldDeleteServerURL() {
        when(http.delete(anyString())).thenReturn(response);
        StubServer server = new StubServer(http, "serverURL", "requestsURL", "stubURL");

        server.close();

        verify(http).delete("serverURL");
    }

    @Test
    public void closeShouldAssert204() {
        when(http.delete(anyString())).thenReturn(response);
        StubServer server = new StubServer(http, "serverURL", "requestsURL", "stubURL");

        server.close();

        verify(response).assertStatusIs(204);    
    }
}
