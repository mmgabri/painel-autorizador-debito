package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.IsoParseResponse;
import br.com.mmgabri.domains.PositionalParseRequest;
import br.com.mmgabri.services.PositionalMessageParseService;
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
@RequestMapping("/api/simulador/positional")
@RequiredArgsConstructor
public class PositionalParseController {

    private static final Logger logger = LoggerFactory.getLogger(PositionalParseController.class);
    private final PositionalMessageParseService positionalParseService;

    @PostMapping("/parse")
    public ResponseEntity<IsoParseResponse> parse(@Valid @RequestBody PositionalParseRequest request) {
        logger.info("Request received to parse positional message.");
        var response = positionalParseService.execute(request);
        logger.info("Positional message parsed successfully.");
        return ResponseEntity.ok(response);
    }
}

