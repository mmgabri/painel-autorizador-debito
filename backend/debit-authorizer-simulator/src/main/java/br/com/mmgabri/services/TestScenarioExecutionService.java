package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.TestScenarioCsvAdapter;
import br.com.mmgabri.domains.IsoParseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestScenarioExecutionService {

    private final TestScenarioCsvAdapter csvAdapter;

    public void execute(IsoParseRequest request) {
        if (request.getIsoMessage() == null || request.getIsoMessage().isBlank()) {
            throw new IllegalArgumentException("isoMessage cannot be blank for execution.");
        }

    }
}
