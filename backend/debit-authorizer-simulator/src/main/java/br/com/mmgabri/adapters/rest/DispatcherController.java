package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.DispatcherEventCsvRequest;
import br.com.mmgabri.domains.DispatcherEventExecutionRequest;
import br.com.mmgabri.domains.DispatcherEventFilterRequest;
import br.com.mmgabri.domains.ErrorResponse;
import br.com.mmgabri.exceptions.ApplicationException;
import br.com.mmgabri.services.DispatcherEventExecutionService;
import br.com.mmgabri.services.DispatcherEventService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dispatcher/eventos")
@RequiredArgsConstructor
public class DispatcherController {

    private static final Logger logger = LoggerFactory.getLogger(DispatcherController.class);

    private final DispatcherEventService dispatcherEventService;
    private final DispatcherEventExecutionService dispatcherEventExecutionService;

    @PostMapping("/salvar")
    public ResponseEntity<?> save(@RequestBody DispatcherEventCsvRequest request) {
        try {
            logger.debug("Request received to save dispatcher event.");
            var saved = dispatcherEventService.save(request);
            logger.info("Dispatcher event saved successfully. id={}", saved.getId());
            if (request.getId() != null && !request.getId().isBlank()) {
                return ResponseEntity.status(HttpStatus.OK).body(saved);
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            }
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on save dispatcher event", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @PostMapping
    public ResponseEntity<?> list(@RequestBody(required = false) DispatcherEventFilterRequest filtro) {
        try {
            String productName = filtro != null ? filtro.getProductName() : null;
            String targetMicroservice = filtro != null ? filtro.getTargetMicroservice() : null;
            String tag = filtro != null ? filtro.getTag() : null;
            String paymentNetwork = filtro != null ? filtro.getPaymentNetwork() : null;
            String messageType = filtro != null ? filtro.getMessageType() : null;
            logger.debug("Request received to list dispatcher events with filters: productName={}, targetMicroservice={}, tag={}, paymentNetwork={}, messageType={}",
                    productName, targetMicroservice, tag, paymentNetwork, messageType);
            var resp = dispatcherEventService.findByFilters(productName, targetMicroservice, tag, paymentNetwork, messageType);
            logger.info("Dispatcher events listed successfully. count={}", resp.size());
            return ResponseEntity.ok(resp);
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on list dispatcher events", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            logger.info("Request received to delete dispatcher event with id: {}", id);
            dispatcherEventService.deleteById(id);
            logger.info("Dispatcher event deleted successfully.");
            return ResponseEntity.noContent().build();
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on delete dispatcher event", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @PostMapping("/executar")
    public ResponseEntity<?> execute(@RequestBody DispatcherEventExecutionRequest request) {
        try {
            logger.info("Request received to execute dispatcher event. productName={}, targetMicroservice={}",
                    request.getProductName(), request.getTargetMicroservice());
            dispatcherEventExecutionService.execute(request);
            return ResponseEntity.ok(Map.of("message", "success"));
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on execute dispatcher event", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }
}
