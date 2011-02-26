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

    public String getURL() {
        return data.getString("path");
    }

    public Map<String, String> getRequestHeaders() {
        return getHeaders(getRequest());
    }

    public String getRequestBody() {
        return getRequest().getString("body");
    }

    public int getResponseCode() {
        return getResponse().getInt("statusCode");
    }

    public Map<String, String> getResponseHeaders() {
        return getHeaders(getResponse());
    }

    public String getResponseBody() {
        return getResponse().getString("body");
    }

    private JSONObject getRequest() {
        return data.getJSONObject("request");
    }

    private JSONObject getResponse() {
        return data.getJSONObject("response");
    }

    private Map<String, String> getHeaders(JSONObject container) {
        Map<String, String> result = new HashMap<String, String>();
        JSONObject headers = container.getJSONObject("headers");
        Iterator iterator = headers.keys();
        while (iterator.hasNext()) {
            String header = (String) iterator.next();
            result.put(header, headers.getString(header));
        }
        return result;
    }
}
