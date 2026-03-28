package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.DispatcherEventoCsvRequest;
import br.com.mmgabri.domains.DispatcherEventoCsvRow;
import br.com.mmgabri.domains.DispatcherEventoExecutarRequest;
import br.com.mmgabri.domains.DispatcherEventoFiltroRequest;
import br.com.mmgabri.services.DispatcherEventoExecutionService;
import br.com.mmgabri.services.DispatcherEventoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatcher/eventos")
@RequiredArgsConstructor
public class DispatcherController {

    private static final Logger logger = LoggerFactory.getLogger(DispatcherController.class);

    private final DispatcherEventoService dispatcherEventoService;
    private final DispatcherEventoExecutionService dispatcherEventoExecutionService;

    @PostMapping("/salvar")
    public ResponseEntity<DispatcherEventoCsvRow> save(@RequestBody DispatcherEventoCsvRequest request) {
        logger.info("Request received to save dispatcher event.");
        var saved = dispatcherEventoService.save(request);
        logger.info("Dispatcher event saved successfully. id={}", saved.getId());
        if (request.getId() != null && !request.getId().isBlank()) {
            return ResponseEntity.status(HttpStatus.OK).body(saved);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
    }

    @PostMapping
    public ResponseEntity<List<DispatcherEventoCsvRow>> list(@RequestBody(required = false) DispatcherEventoFiltroRequest filtro) {
        String productName = filtro != null ? filtro.getProductName() : null;
        String targetMicroservice = filtro != null ? filtro.getTargetMicroservice() : null;
        String tag = filtro != null ? filtro.getTag() : null;
        String paymentNetwork = filtro != null ? filtro.getPaymentNetwork() : null;
        String messageType = filtro != null ? filtro.getMessageType() : null;
        logger.info("Request received to list dispatcher events with filters: productName={}, targetMicroservice={}, tag={}, paymentNetwork={}, messageType={}",
            productName, targetMicroservice, tag, paymentNetwork, messageType);
        var resp = dispatcherEventoService.findByFilters(productName, targetMicroservice, tag, paymentNetwork, messageType);
        logger.info("Dispatcher events listed successfully. count={}", resp.size());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        logger.info("Request received to delete dispatcher event with id: {}", id);
        dispatcherEventoService.deleteById(id);
        logger.info("Dispatcher event deleted successfully.");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/executar")
    public ResponseEntity<Map<String, String>> execute(@RequestBody DispatcherEventoExecutarRequest request) {
        logger.info("Request received to execute dispatcher event. productName={}, targetMicroservice={}",
            request.getProductName(), request.getTargetMicroservice());
        dispatcherEventoExecutionService.execute(request);
        return ResponseEntity.ok(Map.of("message", "success"));
    }
}
