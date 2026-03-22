package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.MessageParseRequest;
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
    public ResponseEntity<TestScenarioCsvRow> save(@RequestBody TestScenarioCsvRequest request) {
        logger.info("Request received to save test scenario.");
        var saved = testScenarioService.save(request);
        logger.info("Test scenario saved successfully.");
        if (request.getId() != null) {
            return ResponseEntity.status(HttpStatus.OK).body(saved);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
    }

    @PostMapping("/executar")
    public ResponseEntity<Map<String, String>> execute(@RequestBody MessageParseRequest request) {
        logger.info("Request received to execute scenario with isoMessage {}", request.getMessage());
        testScenarioExecutionService.execute(request);
        logger.info("Scenario executed successfully via isoMessage.");
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @GetMapping
    public ResponseEntity<List<TestScenarioCsvRow>> list(
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String paymentNetwork,
            @RequestParam(required = false) String messageType) {
        logger.info("Request received to list test scenarios with filters: productName={}, tag={}, paymentNetwork={}, messageType={}",
                productName, tag, paymentNetwork, messageType);
        var resp = testScenarioService.findByFilters(productName, tag, paymentNetwork, messageType);
        logger.info("Test scenarios listed successfully. count={}", resp.size());
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
