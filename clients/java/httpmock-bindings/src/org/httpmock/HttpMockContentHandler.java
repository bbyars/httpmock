package org.httpmock;

import net.sf.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ContentHandler;
import java.net.URLConnection;

public class HttpMockContentHandler extends ContentHandler {
    @Override
    public Object getContent(URLConnection urlConnection) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
        StringBuffer buffer = new StringBuffer();
        String line;

        while ((line = reader.readLine()) != null) {
            buffer.append(line);
        }
        reader.close();

        return JSONObject.fromObject(buffer.toString());
    }
}
