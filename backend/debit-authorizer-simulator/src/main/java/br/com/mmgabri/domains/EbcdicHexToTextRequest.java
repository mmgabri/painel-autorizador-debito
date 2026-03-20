package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EbcdicHexToTextRequest {

    @NotBlank
    private String hexEbcdic;
}

