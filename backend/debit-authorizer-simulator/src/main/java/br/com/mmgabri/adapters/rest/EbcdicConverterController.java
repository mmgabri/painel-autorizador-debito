package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.EbcdicHexToTextRequest;
import br.com.mmgabri.domains.EbcdicHexToTextResponse;
import br.com.mmgabri.domains.EbcdicTextToHexRequest;
import br.com.mmgabri.domains.EbcdicTextToHexResponse;
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
    public ResponseEntity<EbcdicHexToTextResponse> toText(@Valid @RequestBody EbcdicHexToTextRequest request) {
        logger.info("Request received to convert EBCDIC hex to text.");
        String text = ebcdicConverterService.hexEbcdicToText(request.getHexEbcdic());
        logger.info("EBCDIC hex converted to text successfully.");
        return ResponseEntity.ok(new EbcdicHexToTextResponse(text));
    }

    @PostMapping("/to-hex")
    public ResponseEntity<EbcdicTextToHexResponse> toHex(@Valid @RequestBody EbcdicTextToHexRequest request) {
        logger.info("Request received to convert text to EBCDIC hex.");
        String hex = ebcdicConverterService.textToHexEbcdic(request.getText());
        logger.info("Text converted to EBCDIC hex successfully.");
        return ResponseEntity.ok(new EbcdicTextToHexResponse(hex));
    }
}

