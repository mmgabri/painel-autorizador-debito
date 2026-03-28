package br.com.mmgabri.services;

import br.com.mmgabri.domains.DispatcherEventoExecutarRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DispatcherEventoExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(DispatcherEventoExecutionService.class);

    public void execute(DispatcherEventoExecutarRequest request) {
        logger.info("Executing dispatcher event. productName={}, messageModel={}, messageType={}, paymentNetwork={}",
                request.getProductName(), request.getMessageModel(), request.getMessageType(), request.getPaymentNetwork());

        if (request.getStages() != null) {
            request.getStages().forEach(stage ->
                    logger.info("  Stage: duration={}s, tps={}", stage.getDuration(), stage.getTps()));
        }

        logger.info("Dispatcher event executed successfully.");
    }
}
