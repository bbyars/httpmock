package org.httpmock;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

public class Hypermedia {
    public static final String CONTENT_TYPE = "application/vnd.httpmock+json";
    
    public static final String SERVERS_REL = "servers";
    public static final String SERVER_REL = "server";
    public static final String REQUESTS_REL = "request";
    public static final String STUBS_REL = "stub";
    
    private final JSONArray links;

    public Hypermedia(JSONArray links) {
        this.links = links;
    }

    public String getURLForRel(String rel) {
       for (Object obj : links) {
            JSONObject link = (JSONObject)obj;
            String linkRel = link.getString("rel");
            if (linkRel.endsWith(rel)) {
                return link.getString("href");
            }
        }
        return null;
    }
}
