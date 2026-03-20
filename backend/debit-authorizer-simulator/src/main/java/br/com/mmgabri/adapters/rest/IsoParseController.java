package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.IsoBuildRequest;
import br.com.mmgabri.domains.IsoBuildResponse;
import br.com.mmgabri.domains.IsoParseRequest;
import br.com.mmgabri.domains.IsoParseResponse;
import br.com.mmgabri.services.IsoMessageBuilderService;
import br.com.mmgabri.services.IsoMessageParserService;
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
@RequestMapping("/api/simulador/iso")
@RequiredArgsConstructor
public class IsoParseController {

    private static final Logger logger = LoggerFactory.getLogger(IsoParseController.class);
    private final IsoMessageParserService isoParser;
    private final IsoMessageBuilderService isoBuilder;


    @PostMapping("/parse")
    public ResponseEntity<IsoParseResponse> parse(@Valid @RequestBody IsoParseRequest request) throws Exception {
        logger.info("ISO message received for parsing.");
        var response = isoParser.execute(request.getIsoMessage());
        logger.info("ISO message parsed successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<IsoBuildResponse> build(@Valid @RequestBody IsoBuildRequest request) throws Exception {
        logger.info("Request received to build ISO message.");
        var isoMessage = isoBuilder.execute(request);
        logger.info("ISO message built successfully.");
        return ResponseEntity.ok(new IsoBuildResponse(isoMessage));
    }
}
