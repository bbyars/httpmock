package org.httpmock.matchers;

import org.hamcrest.StringDescription;
import org.httpmock.StubRequest;
import org.httpmock.StubServer;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static junit.framework.Assert.*;
import static org.httpmock.matchers.TestStubRequest.request;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class WasCalledTest {
    private final StubServer stub = mock(StubServer.class);

    @Test
    public void shouldNotMatchIfNoRequests() {
        when(stub.getRequests()).thenReturn(new ArrayList<StubRequest>());

        WasCalled matcher = new WasCalled("GET", "/");

        assertFalse(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldMatchWithMatchingRequest() {
        when(stub.getRequests()).thenReturn(listOf(request("GET", "/test")));

        WasCalled matcher = new WasCalled("GET", "/test");

        assertTrue(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldNotMatchDifferentPath() {
        when(stub.getRequests()).thenReturn(listOf(request("GET", "/")));

        WasCalled matcher = new WasCalled("GET", "/test");

        assertFalse(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldNotMatchIfHeaderKeyMissing() {
        when(stub.getRequests()).thenReturn(listOf(request("GET", "/")));

        WasCalled matcher = new WasCalled("GET", "/").withHeader("key", "value");

        assertFalse(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldNotMatchIfHeaderValueDifferent() {
        when(stub.getRequests()).thenReturn(listOf(request("GET", "/").withHeader("key", "1")));

        WasCalled matcher = new WasCalled("GET", "/").withHeader("key", "2");

        assertFalse(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldMatchIfHeaderSame() {
        when(stub.getRequests()).thenReturn(listOf(request("GET", "/").withHeader("key", "1")));

        WasCalled matcher = new WasCalled("GET", "/").withHeader("key", "1");

        assertTrue(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldNotMatchIfOneHeaderDifferent() {
        when(stub.getRequests()).thenReturn(
                listOf(request("GET", "/").withHeader("first", "1").withHeader("second", "2")));

        WasCalled matcher = new WasCalled("GET", "/").withHeader("first", "1").withHeader("second", "1");

        assertFalse(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldMatchMultipleHeaders() {
        when(stub.getRequests()).thenReturn(
                listOf(request("GET", "/").withHeader("first", "1").withHeader("second", "2")));

        WasCalled matcher = new WasCalled("GET", "/").withHeader("first", "1").withHeader("second", "2");

        assertTrue(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldMatchSecondRequestHeader() {
        when(stub.getRequests()).thenReturn(listOf(
                request("GET", "/"),
                request("GET", "/").withHeader("key", "value")));

        WasCalled matcher = new WasCalled("GET", "/").withHeader("key", "value");

        assertTrue(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldNotMatchIfExpectingBodyToMatch() {
        when(stub.getRequests()).thenReturn(listOf(request("POST", "/test")));

        WasCalled matcher = new WasCalled("POST", "/test").withBody("TEST");

        assertFalse(matcher.matchesSafely(stub));
    }
    
    @Test
    public void shouldMatchBodyExactly() {
        when(stub.getRequests()).thenReturn(listOf(request("POST", "/test").withBody("TEST")));

        WasCalled matcher = new WasCalled("POST", "/test").withBody("TEST");

        assertTrue(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldNotMatchBodySubstring() {
        when(stub.getRequests()).thenReturn(listOf(request("POST", "/test")));

        WasCalled matcher = new WasCalled("POST", "/test").withBodyContaining("TEST");

        assertFalse(matcher.matchesSafely(stub));
    }

    @Test
    public void shouldMatchBodySubstring() {
        when(stub.getRequests()).thenReturn(listOf(request("POST", "/test").withBody("{TEST}")));

        WasCalled matcher = new WasCalled("POST", "/test").withBodyContaining("TEST");

        assertTrue(matcher.matchesSafely(stub));
    }
    
    @Test
    public void describeToShouldListAllRequestsToStub() {
        StubRequest firstRequest = request("GET", "/first").withHeader("one", "1").withHeader("key", "value");
        StubRequest secondRequest = request("POST", "/second").withHeader("two", "2").withBody("SECOND");
        when(stub.getRequests()).thenReturn(Arrays.asList(firstRequest, secondRequest));
        WasCalled matcher = new WasCalled("GET", "/").withHeader("key", "value");
        matcher.matchesSafely(stub);
        StringDescription description = new StringDescription();
        
        matcher.describeTo(description);

        String expected = "No request matching GET / {key: value}\n"
                        + "\tGET /first {one: 1, key: value}\n"
                        + "\tPOST /second {two: 2} SECOND";
        assertEquals(String.format(expected), description.toString());
    }

    private List<StubRequest> listOf(StubRequest... arguments) {
        return Arrays.asList(arguments);    
    }
}
