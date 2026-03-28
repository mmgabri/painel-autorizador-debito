package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.MassaTestesCsvRequest;
import br.com.mmgabri.domains.MassaTestesCsvRow;
import br.com.mmgabri.services.MassaTestesService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/massa-testes")
@RequiredArgsConstructor
public class MassaTestesController {

    private static final Logger logger = LoggerFactory.getLogger(MassaTestesController.class);

    private final MassaTestesService massaTestesService;

    @PostMapping("/salvar")
    public ResponseEntity<MassaTestesCsvRow> save(@RequestBody MassaTestesCsvRequest request) {
        logger.info("Request received to save massa de testes.");
        var saved = massaTestesService.save(request);
        logger.info("Massa de testes saved successfully. id={}", saved.getId());
        if (request.getId() != null && !request.getId().isBlank()) {
            return ResponseEntity.status(HttpStatus.OK).body(saved);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
    }

    @GetMapping
    public ResponseEntity<List<MassaTestesCsvRow>> list(
            @RequestParam(required = false) String cartao,
            @RequestParam(required = false) String idConta,
            @RequestParam(required = false) String bandeira,
            @RequestParam(required = false) String modeloMensagem,
            @RequestParam(required = false) String tag) {
        logger.info("Request received to list massa de testes with filters: cartao={}, idConta={}, bandeira={}, modeloMensagem={}, tag={}",
                cartao, idConta, bandeira, modeloMensagem, tag);
        var resp = massaTestesService.findByFilters(cartao, idConta, bandeira, modeloMensagem, tag);
        logger.info("Massa de testes listed successfully. count={}", resp.size());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        logger.info("Request received to delete massa de testes with id: {}", id);
        massaTestesService.deleteById(id);
        logger.info("Massa de testes deleted successfully.");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/carregar-dadinho")
    public ResponseEntity<Map<String, String>> carregarDadinho(@PathVariable String id) {
        logger.info("Request received to carregar dadinho for massa de testes. id={}", id);
        massaTestesService.carregarDadinho(id);
        logger.info("Carregar dadinho executed successfully. id={}", id);
        return ResponseEntity.ok(Map.of("message", "success"));
    }
}
