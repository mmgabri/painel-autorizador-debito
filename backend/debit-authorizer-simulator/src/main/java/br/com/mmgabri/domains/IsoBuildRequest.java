package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class IsoBuildRequest {
    private String messageModel;
    private String bandeira;
    private String mti;
    private Map<String, String> fields;
}