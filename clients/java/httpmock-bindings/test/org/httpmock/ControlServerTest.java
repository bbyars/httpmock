package org.httpmock;

import net.sf.json.JSONObject;
import org.junit.Test;

import static junit.framework.Assert.assertEquals;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.*;

public class ControlServerTest {
    private final HttpMock httpMock = mock(HttpMock.class);
    private final HttpResponse response = mock(HttpResponse.class);
    
    @Test
    public void setupPortShouldPostPortToServersURL() {
        when(httpMock.post(anyString(), any(JSONObject.class))).thenReturn(response);
        when(response.getStatusCode()).thenReturn(201);
        when(response.getBodyAsJSONObject()).thenReturn(JSONObject.fromObject("{'links': []}"));
        ControlServer server = new ControlServer("serversURL", httpMock);

        server.setupPort(123);

        verify(httpMock).post("serversURL", JSONObject.fromObject("{'port': 123}"));
    }

    @Test
    public void setupPortShouldConfigureStubServerWithHypermediaLinks() {
        String json = String.format("{'links': [%s, %s, %s]}",
                link("server", Hypermedia.SERVER_REL),
                link("requests", Hypermedia.REQUESTS_REL),
                link("stubs", Hypermedia.STUBS_REL));
        when(httpMock.post(anyString(), any(JSONObject.class))).thenReturn(response);
        when(response.getStatusCode()).thenReturn(201);
        when(response.getBodyAsJSONObject()).thenReturn(JSONObject.fromObject(json));
        ControlServer server = new ControlServer("serversURL", httpMock);

        StubServer stubServer = server.setupPort(123);

        assertEquals("server", stubServer.serverURL);
        assertEquals("requests", stubServer.requestsURL);
        assertEquals("stubs", stubServer.stubURL);
    }

    @Test
    public void setupPortShouldAssert201StatusCode() {
        when(httpMock.post(anyString(), any(JSONObject.class))).thenReturn(response);
        when(response.getStatusCode()).thenReturn(201);
        when(response.getBodyAsJSONObject()).thenReturn(JSONObject.fromObject("{'links': []}"));
        ControlServer server = new ControlServer("serversURL", httpMock);

        server.setupPort(123);

        verify(response).assertStatusIs(201);
    }

    private String link(String href, String rel) {
        return String.format("{'href': '%s', 'rel': '%s'}", href, rel);
    }
}
