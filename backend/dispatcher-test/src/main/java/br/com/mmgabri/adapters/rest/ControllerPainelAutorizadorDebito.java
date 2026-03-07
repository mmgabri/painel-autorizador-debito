package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.*;
import br.com.mmgabri.services.CenarioTesteCsvService;
import br.com.mmgabri.services.IsoMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulador")
@RequiredArgsConstructor
public class ControllerPainelAutorizadorDebito {

    private static final Logger logger = LoggerFactory.getLogger(ControllerPainelAutorizadorDebito.class);
    private final IsoMessageService isoMessageService;
    private final CenarioTesteCsvService csvService;

    @PostMapping("/iso/parse")
    public ResponseEntity<IsoParseResponse> parse(@Valid @RequestBody IsoParseRequest request) throws Exception {
        logger.info("Mensagem ISO recebida para parsing: {}", request.getIsoMessage());
        IsoParseResponse response = isoMessageService.parse(request.getIsoMessage());
        logger.info("Mensagem ISO parseada com sucesso. MTI: {}, Campos: {}", response.getMti(), response.getFields());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/iso/build")
    public ResponseEntity<IsoBuildResponse> build(@Valid @RequestBody IsoBuildRequest request) throws Exception {
        logger.info("Requisição recebida para construção de mensagem ISO. MTI: {}, Campos: {}",  request.getMti(), request.getFields());
        String isoMessage = isoMessageService.build(request);
        logger.info("Mensagem ISO construída com sucesso: {}", isoMessage);
        return ResponseEntity.ok(new IsoBuildResponse(isoMessage));
    }

    @PostMapping ("/cenarios/salvar")
    public ResponseEntity<CenarioTesteCsv> create(@Valid @RequestBody CenarioTesteCsvRequest request) {
        CenarioTesteCsv saved = csvService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping ("/cenarios")
    public ResponseEntity<List<CenarioTesteCsv>> list() {
        return ResponseEntity.ok(csvService.findAll());
    }
}
