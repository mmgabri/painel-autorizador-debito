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
import java.util.Map;

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

    @PostMapping("/cenarios/salvar")
    public ResponseEntity<CenarioTesteCsv> save(@Valid @RequestBody CenarioTesteCsvRequest request) {
        logger.info("Requisição recebida para salvar cenário de teste.");
        var saved = csvService.save(request);
        logger.info("Cenário de teste salvo com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/cenarios/executar")
    public ResponseEntity<Map<String, String>> execute(@Valid @RequestBody IsoParseRequest request) {
        logger.info("Requisição recebida para executar cenário com isoMessage.");
        csvService.execute(request);
        logger.info("Cenário executado com sucesso via isoMessage.");
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @GetMapping("/cenarios")
    public ResponseEntity<List<CenarioTesteCsv>> list(
            @RequestParam(required = false) String nomeProduto,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String bandeira) {
        logger.info("Requisição recebida para listar cenários de teste.");
        var resp = csvService.findByFilters(nomeProduto, tag, bandeira);
        logger.info("Cenários de teste listados com sucesso.");
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/cenarios/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        logger.info("Requisição recebida para deletar cenário com id: {}", id);
        csvService.deleteById(id);
        logger.info("Cenário de teste deletado com sucesso.");
        return ResponseEntity.noContent().build();
    }
}
