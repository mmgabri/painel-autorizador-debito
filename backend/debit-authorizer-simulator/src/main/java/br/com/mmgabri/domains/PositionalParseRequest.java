package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PositionalParseRequest {

    @NotBlank
    private String messageModel;

    @NotBlank
    private String paymentNetwork;

    @NotBlank
    @Size(min = 750, max = 750)
    private String positionalMessage;
}

