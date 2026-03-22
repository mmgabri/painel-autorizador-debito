package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.services.ProcessMessageService;
import jakarta.validation.Valid;
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
    public ResponseEntity<MessageParseResponse> parse(@Valid @RequestBody MessageParseRequest request) throws Exception {
        var response = processMessage.parse(request);
        logger.info("Message parse successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<MessageBuildResponse> build(@Valid @RequestBody MessageBuildRequest request) throws Exception {
        var response = processMessage.build(request);
        logger.info("Message built successfully.");
        return ResponseEntity.ok(response);
    }
}
