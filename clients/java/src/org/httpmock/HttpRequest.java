package org.httpmock;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class HttpRequest {    
    private final String method;
    private final String url;
    private final Map<String, String> headers = new HashMap<String, String>();
    private String body;

    public HttpRequest(String method, String url) {
        this.method = method;
        this.url = url;
    }

    public HttpRequest withHeader(String name, String value) {
        headers.put(name, value);
        return this;
    }

    public HttpRequest withBody(String body) {
        this.body = body;
        return this;
    }

    public HttpResponse send() {
        try {
            HttpURLConnection connection = (HttpURLConnection)new URL(url).openConnection();
            connection.setRequestMethod(method);
            addHeaders(connection);
            addBody(connection);
            connection.connect();
            return new HttpResponse(connection, readBody(connection));
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void addHeaders(HttpURLConnection connection) {
        for (String header : headers.keySet()) {
            connection.addRequestProperty(header, headers.get(header));
        }
    }

    private void addBody(HttpURLConnection connection) throws IOException {
        if (body != null) {
            connection.setDoOutput(true);
            DataOutputStream output = new DataOutputStream(connection.getOutputStream());
            output.writeBytes(body);
            output.flush();
            output.close();
        }
    }

    public String readBody(HttpURLConnection connection) throws IOException {
        try {
            return readStream(connection.getInputStream());
        }
        catch (IOException e) {
            return readStream(connection.getErrorStream());
        }
    }

    private String readStream(InputStream inputStream) throws IOException {
        if (inputStream == null) {
            return "";
        }
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuffer buffer = new StringBuffer();
        String line;

        while ((line = reader.readLine()) != null) {
            buffer.append(line);
        }
        reader.close();

        return buffer.toString();
    }
}
