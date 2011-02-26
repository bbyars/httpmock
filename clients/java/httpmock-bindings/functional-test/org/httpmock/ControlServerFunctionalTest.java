package org.httpmock;

import org.junit.Test;

import static net.sf.json.test.JSONAssert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class ControlServerFunctionalTest {
    private final Http http = new Http();

    @Test
    public void shouldStartAndCloseServer() {
        StubServer server = ControlServer.at("http://localhost:3000").setupPort(3001);
        HttpResponse response = http.get("http://localhost:3001");
        assertEquals(200, response.getStatusCode());

        server.close();
        try {
            http.get("http://localhost:3001");
            fail("should have refused connection");
        }
        catch (RuntimeException e) {
            assertTrue(e.getMessage().contains("Connection refused"));
        }
    }       
}
