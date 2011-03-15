package org.httpmock;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static junit.framework.Assert.assertEquals;

public class StubbingFunctionalTest {
    private static StubServer stub;

    @Before
    public void connectToServer() {
        stub = ControlServer.at("http://localhost:3000").setupPort(3001);
    }

    @After
    public void shutdownServer() {
        stub.close();
    }

    @Test
    public void shouldStubStatusCode() {
        stub.on("GET", "/").returns(new Stub().withStatus(400));

        HttpResponse response = new HttpRequest("GET", "http://localhost:3001/").send();

        assertEquals(400, response.getStatusCode());
    }

    @Test
    public void shouldStubBody() {
        stub.on("GET", "/").returns(new Stub().withStatus(200).withBody("BODY"));

        HttpResponse response = new HttpRequest("GET", "http://localhost:3001/").send();

        assertEquals(200, response.getStatusCode());
        assertEquals("BODY", response.getBody());
    }

    @Test
    public void shouldStubHeader() {
        stub.on("GET", "/").returns(new Stub().withHeader("X-Test", "test"));

        HttpResponse response = new HttpRequest("GET", "http://localhost:3001/").send();

        assertEquals("test", response.getHeader("X-Test"));
    }
}
