package br.com.mmgabri.services;

import br.com.mmgabri.domains.NumberGeneratorRequest;
import br.com.mmgabri.domains.NumberGeneratorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NumberGeneratorOrchestrationService {

    private final NumberGeneratorService numberGeneratorService;

    public NumberGeneratorResponse execute(NumberGeneratorRequest request, int digits) {
        String number = numberGeneratorService.generate(
                request.getMti(),
                request.getDe2(),
                request.getDe11(),
                request.getDe7(),
                digits
        );
        return new NumberGeneratorResponse(number);
    }
}

