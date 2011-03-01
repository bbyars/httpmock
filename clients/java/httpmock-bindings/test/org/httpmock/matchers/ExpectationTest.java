package org.httpmock.matchers;

import org.junit.Test;

import static junit.framework.Assert.assertFalse;
import static junit.framework.Assert.assertTrue;
import static org.httpmock.matchers.TestStubRequest.request;

public class ExpectationTest {
    @Test
    public void shouldMatchWithMatchingRequest() {
        Expectation expectation = new Expectation("GET", "/test");
        assertTrue(expectation.matches(request("GET", "/test")));
    }

    @Test
    public void shouldNotMatchDifferentPath() {
        Expectation expectation = new Expectation("GET", "/test");
        assertFalse(expectation.matches(request("GET", "/")));
    }

    @Test
    public void shouldNotMatchIfHeaderKeyMissing() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("key", "value");

        assertFalse(expectation.matches(request("GET", "/")));
    }

    @Test
    public void shouldNotMatchIfHeaderValueDifferent() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("key", "2");

        assertFalse(expectation.matches(request("GET", "/").withHeader("key", "1")));
    }

    @Test
    public void shouldMatchIfHeaderSame() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("key", "1");

        assertTrue(expectation.matches(request("GET", "/").withHeader("key", "1")));
    }

    @Test
    public void shouldNotMatchIfOneHeaderDifferent() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("first", "1");
        expectation.addHeader("second", "1");

        assertFalse(expectation.matches(request("GET", "/")
                .withHeader("first", "1")
                .withHeader("second", "2")));
    }

    @Test
    public void shouldMatchMultipleHeaders() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("first", "1");
        expectation.addHeader("second", "2");

        assertTrue(expectation.matches(request("GET", "/")
                .withHeader("first", "1")
                .withHeader("second", "2")));
    }

    @Test
    public void shouldMatchHeaderKeyCaseInsensitive() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("key", "value");

        assertTrue(expectation.matches(request("GET", "/").withHeader("KEY", "value")));
    }

    @Test
    public void shouldNotMatchHeaderValueCaseInsensitive() {
        Expectation expectation = new Expectation("GET", "/");
        expectation.addHeader("key", "value");

        assertFalse(expectation.matches(request("GET", "/").withHeader("key", "VALUE")));
    }

    @Test
    public void shouldNotMatchBodyIfNoBodyRequested() {
        Expectation expectation = new Expectation("PUT", "/test");
        expectation.matchBody("TEST");

        assertFalse(expectation.matches(request("PUT", "/test")));
    }
    
    @Test
    public void shouldMatchBody() {
        Expectation expectation = new Expectation("POST", "/test");
        expectation.matchBody("TEST");

        assertTrue(expectation.matches(request("POST", "/test").withBody("TEST")));
    }

    @Test
    public void shouldNotMatchIfBodyDifferent() {
        Expectation expectation = new Expectation("POST", "/test");
        expectation.matchBody("TEST");

        assertFalse(expectation.matches(request("POST", "/test").withBody("TEST 1 2 3")));
    }

    @Test
    public void shouldNotMatchBodySubstringIfNoBodyRequested() {
        Expectation expectation = new Expectation("PUT", "/test");
        expectation.matchBodySubstring("TEST");

        assertFalse(expectation.matches(request("PUT", "/test")));
    }

    @Test
    public void shouldMatchBodySubstring() {
        Expectation expectation = new Expectation("POST", "/test");
        expectation.matchBodySubstring("TEST");

        assertTrue(expectation.matches(request("POST", "/test").withBody("{TEST}")));   
    }

    @Test
    public void shouldNotMatchBodySubstringIfBodyNotContainText() {
        Expectation expectation = new Expectation("POST", "/test");
        expectation.matchBodySubstring("TEST");

        assertFalse(expectation.matches(request("POST", "/test").withBody("1 2 3")));
    }
}
