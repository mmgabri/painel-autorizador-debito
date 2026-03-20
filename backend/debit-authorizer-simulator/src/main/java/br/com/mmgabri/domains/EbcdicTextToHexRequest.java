package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EbcdicTextToHexRequest {

    @NotBlank
    private String text;
}

