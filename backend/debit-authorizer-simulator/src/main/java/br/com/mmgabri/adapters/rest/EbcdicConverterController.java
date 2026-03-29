package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.EbcdicHexToTextRequest;
import br.com.mmgabri.domains.EbcdicHexToTextResponse;
import br.com.mmgabri.domains.EbcdicTextToHexRequest;
import br.com.mmgabri.domains.EbcdicTextToHexResponse;
import br.com.mmgabri.domains.ErrorResponse;
import br.com.mmgabri.exceptions.ApplicationException;
import br.com.mmgabri.services.EbcdicConverterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulador/ebcdic")
@RequiredArgsConstructor
public class EbcdicConverterController {

    private static final Logger logger = LoggerFactory.getLogger(EbcdicConverterController.class);
    private final EbcdicConverterService ebcdicConverterService;

    @PostMapping("/to-text")
    public ResponseEntity<?> toText(@Valid @RequestBody EbcdicHexToTextRequest request) {
        try {
            logger.debug("Request received to convert EBCDIC hex to text.");
            String text = ebcdicConverterService.hexEbcdicToText(request.getHexEbcdic());
            logger.info("EBCDIC hex converted to text successfully.");
            return ResponseEntity.ok(new EbcdicHexToTextResponse(text));
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on EBCDIC to text conversion", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @PostMapping("/to-hex")
    public ResponseEntity<?> toHex(@Valid @RequestBody EbcdicTextToHexRequest request) {
        try {
            logger.debug("Request received to convert text to EBCDIC hex.");
            String hex = ebcdicConverterService.textToHexEbcdic(request.getText());
            logger.info("Text converted to EBCDIC hex successfully.");
            return ResponseEntity.ok(new EbcdicTextToHexResponse(hex));
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on text to EBCDIC conversion", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }
}
