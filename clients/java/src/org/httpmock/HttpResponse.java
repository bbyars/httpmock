package org.httpmock;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.io.IOException;
import java.net.HttpURLConnection;

public class HttpResponse {
    private final HttpURLConnection connection;
    private final String body;

    public HttpResponse(HttpURLConnection connection, String body) {
        this.connection = connection;
        this.body = body;
    }

    public String getHeader(String headerName) {
        return connection.getHeaderField(headerName);
    }

    public String getBody() {
        return body;
    }

    public JSONObject getBodyAsJSONObject() {
        return JSONObject.fromObject(getBody());
    }

    public JSONArray getBodyAsJSONArray() {
        return JSONArray.fromObject(getBody());
    }

    public int getStatusCode() {
        try {
            return connection.getResponseCode();
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void assertStatusIs(int statusCode) {
        if (statusCode != getStatusCode()) {
            throw new RuntimeException(String.format("Expected %s status code, received %d (%s %s)\n%s",
                statusCode, getStatusCode(), connection.getRequestMethod(), connection.getURL().toString(), getBody()));
        }
    }
}
