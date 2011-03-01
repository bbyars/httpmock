package org.httpmock;

import org.junit.Test;

import static net.sf.json.test.JSONAssert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class ControlServerFunctionalTest {
    @Test
    public void shouldStartAndCloseServer() throws InterruptedException {
        StubServer server = ControlServer.at("http://localhost:3000").setupPort(3001);

        // Note we have to set the Connection: close header or the next request
        // doesn't initiate a new TCP connection, which is the error we're looking for.
        HttpResponse response = new HttpRequest("GET", "http://localhost:3001")
                .withHeader("Connection", "close")
                .send();
        
        assertEquals(200, response.getStatusCode());

        server.close();
        
        try {
            new HttpRequest("GET", "http://localhost:3001").send();
            fail("should have refused connection");
        }
        catch (RuntimeException e) {
            assertTrue(e.getMessage().contains("Connection refused"));
        }
    }       
}
