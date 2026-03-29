package br.com.mmgabri.exceptions;

public class ApplicationException extends RuntimeException {

    private final String code;
    private final String description;

    public ApplicationException(String code, String description) {
        super(description);
        this.code = code;
        this.description = description;
    }

    public ApplicationException(String code, String description, Throwable cause) {
        super(description, cause);
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}