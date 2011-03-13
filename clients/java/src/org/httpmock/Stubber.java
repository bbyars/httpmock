package org.httpmock;

public class Stubber {
    private final HttpMock httpMock;

    private final String urlToSetStub;
    private final String urlToStub;
    private String requestMethod;

    public Stubber(HttpMock httpMock, String urlToSetStub, String urlToStub) {
        this.httpMock = httpMock;
        this.urlToSetStub = urlToSetStub;
        this.urlToStub = urlToStub;
    }

    public void setRequestMethod(String requestMethod) {
        this.requestMethod = requestMethod;
    }

    public void returns(Stub stub) {
        stub.withRequestMethod(requestMethod).withPath(urlToStub);
        HttpResponse response = httpMock.post(urlToSetStub, stub.getJSON());
        response.assertStatusIs(204);
    }
}
