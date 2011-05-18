package org.httpmock;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.List;

import static junit.framework.Assert.assertEquals;
import static org.hamcrest.CoreMatchers.not;
import static org.httpmock.matchers.WasCalled.wasCalled;
import static org.junit.Assert.assertThat;

public class WasCalledAtFunctionalTest {
    private static StubServer stub;
    private static String controlServerURL;

    @BeforeClass
    public static void configureURL() {
        controlServerURL = System.getenv("url");
        if (controlServerURL == null) {
            controlServerURL = "http://localhost:3000";
            System.out.println("url environment variable not set; defaulting to " + controlServerURL);
        }
    }

    @Before
    public void connectToServer() {
        stub = ControlServer.at(controlServerURL).setupPort(3001);
    }

    @After
    public void shutdownServer() {
        stub.close();
    }

    @Test
    public void shouldReturnAllRequestsToStub() {
        new HttpRequest("GET", "http://localhost:3001/first").send();
        new HttpRequest("POST", "http://localhost:3001/second?with=query").withBody("TEST").send();

        List<StubRequest> requests = stub.getRequests();

        assertEquals(2, requests.size());
        assertEquals("/first", requests.get(0).getPath());
        assertEquals("GET", requests.get(0).getRequestMethod());
        assertEquals("/second?with=query", requests.get(1).getPath());
        assertEquals("TEST", requests.get(1).getBody());
        assertEquals("POST", requests.get(1).getRequestMethod());
    }

    @Test
    public void wasCalledShouldMatchPath() {
        new HttpRequest("GET", "http://localhost:3001/first").send();

        assertThat(stub, wasCalled("GET", "/first"));
        assertThat(stub, not(wasCalled("GET", "/second")));
    }

    @Test
    public void wasCalledShouldMatchHeader() {
        new HttpRequest("GET", "http://localhost:3001/")
                .withHeader("X-Test", "Got it!")
                .send();

        assertThat(stub, wasCalled("GET", "/").withHeader("X-Test", "Got it!"));
        assertThat(stub, not(wasCalled("GET", "/").withHeader("INVALID", "ignore")));
    }

    @Test
    public void wasCalledShouldMatchBodyExactly() {
        new HttpRequest("POST", "http://localhost:3001/")
                .withBody("TEST")
                .send();

        assertThat(stub, wasCalled("POST", "/").withBody("TEST"));
        assertThat(stub, not(wasCalled("POST", "/").withBody("ES")));
    }

    @Test
    public void wasCalledShouldMatchBodySubstring() {
        new HttpRequest("POST", "http://localhost:3001/")
                .withBody("{TEST}")
                .send();

        assertThat(stub, wasCalled("POST", "/").withBodyContaining("TEST"));
        assertThat(stub, not(wasCalled("POST", "/").withBodyContaining("es")));
    }

    @Test
    public void wasCalledShouldMatchHeadersAndBody() {
        new HttpRequest("POST", "http://localhost:3001/")
                .withHeader("Content-Type", "text/plain")
                .withHeader("Accept", "text/plain")
                .withBody("TEST")
                .send();

        assertThat(stub, wasCalled("POST", "/")
                            .withHeader("Content-Type", "text/plain")
                            .withHeader("Accept", "text/plain")
                            .withBodyContaining("TEST"));
    }

}
