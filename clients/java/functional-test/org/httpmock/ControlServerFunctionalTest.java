package org.httpmock;

import org.junit.Test;

import static net.sf.json.test.JSONAssert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class ControlServerFunctionalTest {
    @Test
    public void shouldStartAndCloseServer() throws InterruptedException {
        StubServer server = ControlServer.at("http://localhost:3000").setupPort(3001);

        HttpResponse response = new HttpRequest("GET", "http://localhost:3001")
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
