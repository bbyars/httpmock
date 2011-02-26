package org.httpmock;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ContentHandler;
import java.net.ContentHandlerFactory;
import java.net.URLConnection;

public class HttpMockContentHandlerFactory implements ContentHandlerFactory {    
    public ContentHandler createContentHandler(String mimeType) {
        return new ContentHandler() {
            @Override
            public Object getContent(URLConnection urlConnection) throws IOException
            {
                BufferedReader reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
                StringBuffer buffer = new StringBuffer();
                String line;

                while ((line = reader.readLine()) != null) {
                    buffer.append(line);
                }
                reader.close();

                return buffer.toString();
            }
        };
//        if (Hypermedia.CONTENT_TYPE.equals(mimeType)) {
//            return new HttpMockContentHandler();
//        }
//        return null;
    }
}
