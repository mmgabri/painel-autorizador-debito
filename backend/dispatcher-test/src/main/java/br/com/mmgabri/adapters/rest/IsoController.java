package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.IsoBuildRequest;
import br.com.mmgabri.domains.IsoBuildResponse;
import br.com.mmgabri.domains.IsoParseRequest;
import br.com.mmgabri.domains.IsoParseResponse;
import br.com.mmgabri.services.IsoMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/iso")
@RequiredArgsConstructor
public class IsoController {

    private final IsoMessageService isoMessageService;
    private static final Logger logger = LoggerFactory.getLogger(IsoController.class);

    @PostMapping("/parse")
    public ResponseEntity<IsoParseResponse> parse(@Valid @RequestBody IsoParseRequest request) throws Exception {
        logger.info("Mensagem ISO recebida para parsing: {}", request.getIsoMessage());
        IsoParseResponse response = isoMessageService.parse(request.getIsoMessage());
        logger.info("Mensagem ISO parseada com sucesso. MTI: {}, Campos: {}", response.getMti(), response.getFields());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<IsoBuildResponse> build(@Valid @RequestBody IsoBuildRequest request) throws Exception {
        logger.info("Requisição recebida para construção de mensagem ISO. MTI: {}, Campos: {}",  request.getMti(), request.getFields());
        String isoMessage = isoMessageService.build(request);
        logger.info("Mensagem ISO construída com sucesso: {}", isoMessage);
        return ResponseEntity.ok(new IsoBuildResponse(isoMessage));
    }
}
