package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.ErrorResponse;
import br.com.mmgabri.domains.NumberGeneratorRequest;
import br.com.mmgabri.domains.NumberGeneratorResponse;
import br.com.mmgabri.exceptions.ApplicationException;
import br.com.mmgabri.services.NumberGeneratorOrchestrationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/simulador/number-generator")
@RequiredArgsConstructor
public class NumberGeneratorController {

    private static final Logger logger = LoggerFactory.getLogger(NumberGeneratorController.class);
    private final NumberGeneratorOrchestrationService numberGeneratorOrchestrationService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestParam @Min(1) @Max(20) int digits,
            @Valid @RequestBody NumberGeneratorRequest request) {
        try {
            logger.info("Request received to generate a number. digits={}", digits);
            NumberGeneratorResponse response = numberGeneratorOrchestrationService.execute(request, digits);
            logger.info("Number generated successfully. digits={}", digits);
            return ResponseEntity.ok(response);
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on number generation", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }
}
