package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IsoParseRequest {

    private String isoMessage;
    private String messageModel;
    private String bandeira;
}
