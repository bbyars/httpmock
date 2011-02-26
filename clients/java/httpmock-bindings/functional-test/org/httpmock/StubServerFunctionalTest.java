package org.httpmock;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

import static junit.framework.Assert.assertEquals;

public class StubServerFunctionalTest {
    private final Http http = new Http();
    private StubServer stub;

    @Before
    public void connectToServer() {
        stub = ControlServer.at("http://localhost:3000").setupPort(3001);
    }

    @After
    public void shutdownServer() {
        stub.close();
    }

    @Test
    public void shouldReturnAllRequestsToStub() {
        new HttpRequest("GET", "http://localhost:3001/first").send().waitForClose();
        new HttpRequest("POST", "http://localhost:3001/second?with=query").withBody("TEST").send().waitForClose();

        List<StubRequest> requests = stub.getRequests();

        assertEquals(2, requests.size());
        assertEquals("/first", requests.get(0).getURL());
//        assertEquals("GET", requests.get(0).getRequestMethod());
        assertEquals("/second?with=query", requests.get(1).getURL());
//        assertEquals("TEST", requests.get(1).getRequestBody());
//        assertEquals("POST", requests.get(1).getRequestMethod());
    }

}
