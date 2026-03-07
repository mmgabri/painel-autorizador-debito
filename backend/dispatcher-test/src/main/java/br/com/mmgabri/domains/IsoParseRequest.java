package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IsoParseRequest {

   // @NotBlank
    private String isoMessage;
}