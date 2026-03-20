package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.IsoParseRequest;
import br.com.mmgabri.domains.TestScenarioCsvRequest;
import br.com.mmgabri.domains.TestScenarioCsvRow;
import br.com.mmgabri.services.TestScenarioExecutionService;
import br.com.mmgabri.services.TestScenarioService;
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
@RequestMapping("/api/simulador/cenarios")
@RequiredArgsConstructor
public class TestScenarioController {

    private static final Logger logger = LoggerFactory.getLogger(TestScenarioController.class);
    private final TestScenarioService testScenarioService;
    private final TestScenarioExecutionService testScenarioExecutionService;

    @PostMapping("/salvar")
    public ResponseEntity<TestScenarioCsvRow> save(@Valid @RequestBody TestScenarioCsvRequest request) {
        logger.info("Request received to save test scenario.");
        var saved = testScenarioService.save(request);
        logger.info("Test scenario saved successfully.");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/executar")
    public ResponseEntity<Map<String, String>> execute(@Valid @RequestBody IsoParseRequest request) {
        logger.info("Request received to execute scenario with isoMessage.");
        testScenarioExecutionService.execute(request);
        logger.info("Scenario executed successfully via isoMessage.");
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @GetMapping(params = {"!productName", "!tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> list() {
        logger.info("Request received to list test scenarios.");
        var resp = testScenarioService.findAll();
        logger.info("Test scenarios listed successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"productName", "!tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByNomeProduto(@RequestParam String productName) {
        logger.info("Request received to list scenarios by productName.");
        var resp = testScenarioService.findByProductName(productName);
        logger.info("Test scenarios filtered by productName successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"!productName", "tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByTag(@RequestParam String tag) {
        logger.info("Request received to list scenarios by tag.");
        var resp = testScenarioService.findByTag(tag);
        logger.info("Test scenarios filtered by tag successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"productName", "tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByNomeProdutoAndTag(@RequestParam String productName,
                                                                            @RequestParam String tag) {
        logger.info("Request received to list scenarios by productName and tag.");
        var resp = testScenarioService.findByNomeProdutoAndTag(productName, tag);
        logger.info("Test scenarios filtered by productName and tag successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"paymentNetwork", "!productName", "!tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByBandeira(@RequestParam String paymentNetwork) {
        logger.info("Request received to list scenarios by paymentNetwork.");
        var resp = testScenarioService.findByBandeira(paymentNetwork);
        logger.info("Test scenarios filtered by paymentNetwork successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"paymentNetwork", "productName", "!tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByBandeiraAndNomeProduto(@RequestParam String paymentNetwork,
                                                                                 @RequestParam String productName) {
        logger.info("Request received to list scenarios by paymentNetwork and productName.");
        var resp = testScenarioService.findByBandeiraAndNomeProduto(paymentNetwork, productName);
        logger.info("Test scenarios filtered by paymentNetwork and productName successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"paymentNetwork", "!productName", "tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByBandeiraAndTag(@RequestParam String paymentNetwork,
                                                                         @RequestParam String tag) {
        logger.info("Request received to list scenarios by paymentNetwork and tag.");
        var resp = testScenarioService.findByBandeiraAndTag(paymentNetwork, tag);
        logger.info("Test scenarios filtered by paymentNetwork and tag successfully.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping(params = {"paymentNetwork", "productName", "tag"})
    public ResponseEntity<List<TestScenarioCsvRow>> listByBandeiraAndNomeProdutoAndTag(@RequestParam String paymentNetwork,
                                                                                       @RequestParam String productName,
                                                                                       @RequestParam String tag) {
        logger.info("Request received to list scenarios by paymentNetwork, productName and tag.");
        var resp = testScenarioService.findByBandeiraAndNomeProdutoAndTag(paymentNetwork, productName, tag);
        logger.info("Test scenarios filtered by paymentNetwork, productName and tag successfully.");
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        logger.info("Request received to delete scenario with id: {}", id);
        testScenarioService.deleteById(id);
        logger.info("Test scenario deleted successfully.");
        return ResponseEntity.noContent().build();
    }
}
