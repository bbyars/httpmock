package org.httpmock;

import net.sf.json.JSONArray;
import org.junit.Test;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertNull;

public class HypermediaTest {
    @Test
    public void getURLForRelShouldReturnNullIfNoLinks() {
        Hypermedia hypermedia = hypermediaFor("[]");
        
        assertNull(hypermedia.getURLForRel("test"));
    }

    @Test
    public void getURLForRelShouldReturnCorrectLink() {
        Hypermedia hypermedia = hypermediaFor("[{'href': 'one', 'rel': 'first'}, {'href': 'two', 'rel': 'second'}]");

        assertEquals("one", hypermedia.getURLForRel("first"));
        assertEquals("two", hypermedia.getURLForRel("second"));
    }

    private Hypermedia hypermediaFor(String json) {
        JSONArray links = JSONArray.fromObject(json);
        return new Hypermedia(links);
    }
}
