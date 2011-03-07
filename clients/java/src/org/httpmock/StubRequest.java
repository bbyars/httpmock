package org.httpmock;

import net.sf.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class StubRequest {
    private final JSONObject data;

    public StubRequest(JSONObject data) {
        this.data = data;
    }

    public String getRequestMethod() {
        return data.getString("method");
    }
    
    public String getPath() {
        return data.getString("path");
    }

    public Map<String, String> getHeaders() {
        Map<String, String> result = new HashMap<String, String>();
        JSONObject headers = data.getJSONObject("headers");
        Iterator iterator = headers.keys();
        while (iterator.hasNext()) {
            String header = (String) iterator.next();
            result.put(header, headers.getString(header));
        }
        return result;
    }

    public String getBody() {
        return data.getString("body");
    }
}
