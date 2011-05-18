package org.httpmock;

import org.junit.BeforeClass;
import org.junit.Test;

import static net.sf.json.test.JSONAssert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class ControlServerFunctionalTest {
    private static String controlServerURL;

    @BeforeClass
    public static void configureURL() {
        controlServerURL = System.getenv("url");
        if (controlServerURL == null) {
            controlServerURL = "http://localhost:3000";
            System.out.println("url environment variable not set; defaulting to " + controlServerURL);
        }
    }

    @Test
    public void shouldStartAndCloseServer() throws InterruptedException {
        StubServer server = ControlServer.at(controlServerURL).setupPort(3001);

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
