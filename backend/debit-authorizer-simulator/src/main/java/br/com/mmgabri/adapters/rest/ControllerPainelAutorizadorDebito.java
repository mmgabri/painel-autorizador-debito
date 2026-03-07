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
        logger.info("Mensagem ISO recebida para parsing.");
        var response = isoMessageService.parse(request.getIsoMessage());
        logger.info("Mensagem ISO parseada com sucesso.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/iso/build")
    public ResponseEntity<IsoBuildResponse> build(@Valid @RequestBody IsoBuildRequest request) throws Exception {
        logger.info("Requisição recebida para construção de mensagem ISO.");
        var isoMessage = isoMessageService.build(request);
        logger.info("Mensagem ISO construída com sucesso.");
        return ResponseEntity.ok(new IsoBuildResponse(isoMessage));
    }

    @PostMapping ("/cenarios/salvar")
    public ResponseEntity<CenarioTesteCsv> create(@Valid @RequestBody CenarioTesteCsvRequest request) {
        logger.info("Requisição recebida para salvar cenário de teste.");
        var saved = csvService.save(request);
        logger.info("Cenário de teste salvo com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping ("/cenarios")
    public ResponseEntity<List<CenarioTesteCsv>> list() {
        logger.info("Requisição recebida para listar cenários de teste.");
        var resp = csvService.findAll();
        logger.info("Cenários de teste listados com sucesso.");
        return ResponseEntity.ok(resp);

    }
}