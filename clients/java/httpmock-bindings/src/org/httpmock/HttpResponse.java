package org.httpmock;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

public class HttpResponse {
    private final HttpURLConnection connection;

    public HttpResponse(HttpURLConnection connection) {
        this.connection = connection;
    }

    public void waitForClose() {
        getBody();
    }

    public String getHeader(String headerName) {
        return connection.getHeaderField(headerName);
    }

    public String getBody() {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuffer buffer = new StringBuffer();
            String line;

            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }
            reader.close();

            return buffer.toString();
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
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
