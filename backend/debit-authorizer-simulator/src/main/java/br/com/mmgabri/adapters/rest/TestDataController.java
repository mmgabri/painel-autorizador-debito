package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.ErrorResponse;
import br.com.mmgabri.domains.TestDataCsvRequest;
import br.com.mmgabri.domains.TestDataCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import br.com.mmgabri.services.TestDataService;
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
public class TestDataController {

    private static final Logger logger = LoggerFactory.getLogger(TestDataController.class);

    private final TestDataService testDataService;

    @PostMapping("/salvar")
    public ResponseEntity<?> save(@RequestBody TestDataCsvRequest request) {
        try {
            logger.debug("Request received to save test data.");
            var saved = testDataService.save(request);
            logger.info("Test data saved successfully. id={}", saved.getId());
            if (request.getId() != null && !request.getId().isBlank()) {
                return ResponseEntity.status(HttpStatus.OK).body(saved);
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            }
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on save test data", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String cardNumber,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String paymentNetwork,
            @RequestParam(required = false) String messageModel,
            @RequestParam(required = false) String tag) {
        try {
            logger.debug("Request received to list test data with filters: cardNumber={}, accountId={}, paymentNetwork={}, messageModel={}, tag={}",
                    cardNumber, accountId, paymentNetwork, messageModel, tag);
            var resp = testDataService.findByFilters(cardNumber, accountId, paymentNetwork, messageModel, tag);
            logger.info("Test data listed successfully. count={}", resp.size());
            return ResponseEntity.ok(resp);
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on list test data", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            logger.debug("Request received to delete test data with id: {}", id);
            testDataService.deleteById(id);
            logger.info("Test data deleted successfully.");
            return ResponseEntity.noContent().build();
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on delete test data", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @PostMapping("/{id}/carregar-dadinho")
    public ResponseEntity<?> loadTestData(@PathVariable String id) {
        try {
            logger.debug("Request received to load test data into Keyspaces. id={}", id);
            testDataService.loadTestData(id);
            logger.info("Test data loaded successfully. id={}", id);
            return ResponseEntity.ok(Map.of("message", "success"));
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on load test data", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }
}
