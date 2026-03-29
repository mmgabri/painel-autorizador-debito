package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.ErrorResponse;
import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.exceptions.ApplicationException;
import br.com.mmgabri.services.ProcessMessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulador/message/")
@RequiredArgsConstructor
public class MessageParseController {

    private static final Logger logger = LoggerFactory.getLogger(MessageParseController.class);
    private final ProcessMessageService processMessage;


    @PostMapping("/parse")
    public ResponseEntity<?> parse(@RequestBody MessageParseRequest request) {
        try {
            var response = processMessage.parse(request);
            logger.info("Message parse successfully.");
            return ResponseEntity.ok(response);
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on parse", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }

    @PostMapping("/build")
    public ResponseEntity<?> build(@RequestBody MessageBuildRequest request) {
        try {
            var response = processMessage.build(request);
            logger.info("Message built successfully.");
            return ResponseEntity.ok(response);
        } catch (ApplicationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getCode(), e.getDescription()));
        } catch (Exception e) {
            logger.error("Unexpected error on build", e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "Erro interno inesperado."));
        }
    }
}
