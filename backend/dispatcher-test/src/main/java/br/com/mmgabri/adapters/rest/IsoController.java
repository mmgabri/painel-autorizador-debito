package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.IsoBuildRequest;
import br.com.mmgabri.domains.IsoBuildResponse;
import br.com.mmgabri.domains.IsoParseRequest;
import br.com.mmgabri.domains.IsoParseResponse;
import br.com.mmgabri.services.IsoMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/iso")
public class IsoController {

    private final IsoMessageService isoMessageService;

    public IsoController(IsoMessageService isoMessageService) {
        this.isoMessageService = isoMessageService;
    }

    @PostMapping("/parse")
    public ResponseEntity<IsoParseResponse> parse(@Valid @RequestBody IsoParseRequest request) throws Exception {
        IsoParseResponse response = isoMessageService.parse(request.getIsoMessage(), request.getEncoding());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<IsoBuildResponse> build(@Valid @RequestBody IsoBuildRequest request) throws Exception {
        String isoMessage = isoMessageService.build(request);
        return ResponseEntity.ok(new IsoBuildResponse(isoMessage));
    }
}
