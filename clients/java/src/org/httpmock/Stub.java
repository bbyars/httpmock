package org.httpmock;

import net.sf.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class Stub {
    private String requestMethod;
    private String path;
    private int statusCode;
    private String body;
    private final Map<String, String> headers = new HashMap<String, String>();

    public Stub withStatus(int statusCode) {
        this.statusCode = statusCode;
        return this;
    }

    public Stub withBody(String body) {
        this.body = body;
        return this;
    }

    public Stub withHeader(String key, String value) {
        headers.put(key, value);
        return this;
    }
    
    Stub withRequestMethod(String requestMethod) {
        this.requestMethod = requestMethod;
        return this;
    }

    Stub withPath(String path) {
        this.path = path;
        return this;
    }

    JSONObject getJSON() {
        Map map = new HashMap();
        map.put("path", path);
        map.put("request", getRequest());
        map.put("response", getResponse());
        return JSONObject.fromObject(map);
    }

    private Map getRequest() {
        Map map = new HashMap();
        map.put("method", requestMethod);
        return map;
    }

    private Map getResponse() {
        Map map = new HashMap();
        map.put("statusCode", statusCode);
        if (body != null) {
            map.put("body", body);
        }
        map.put("headers", headers);
        return map;
    }
}
