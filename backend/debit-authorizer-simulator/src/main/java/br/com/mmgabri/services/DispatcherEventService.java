package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.DispatcherEventCsvAdapter;
import br.com.mmgabri.domains.DispatcherEventCsvRequest;
import br.com.mmgabri.domains.DispatcherEventCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class DispatcherEventService {

    private final DispatcherEventCsvAdapter csvAdapter;

    public DispatcherEventService(DispatcherEventCsvAdapter csvAdapter) {
        this.csvAdapter = csvAdapter;
    }

    public DispatcherEventCsvRow save(DispatcherEventCsvRequest request) {
        if (request.getId() != null && !request.getId().isBlank()) {
            return updateById(request);
        }

        DispatcherEventCsvRow row = new DispatcherEventCsvRow();
        row.setId(UUID.randomUUID().toString());
        row.setProductName(request.getProductName());
        row.setTargetMicroservice(request.getTargetMicroservice());
        row.setMessageModel(request.getMessageModel());
        row.setMessageType(request.getMessageType());
        row.setPaymentNetwork(request.getPaymentNetwork());
        row.setTag(request.getTag());
        row.setDescription(request.getDescription());
        row.setMessage(request.getMessage());
        row.setUpdatedAt(LocalDateTime.now().toString());
        csvAdapter.append(row);
        return row;
    }

    private DispatcherEventCsvRow updateById(DispatcherEventCsvRequest request) {
        String id = request.getId().trim();
        List<DispatcherEventCsvRow> events = csvAdapter.findAll();

        for (DispatcherEventCsvRow event : events) {
            if (id.equals(event.getId())) {
                event.setId(id);
                event.setProductName(request.getProductName());
                event.setTargetMicroservice(request.getTargetMicroservice());
                event.setMessageModel(request.getMessageModel());
                event.setMessageType(request.getMessageType());
                event.setPaymentNetwork(request.getPaymentNetwork());
                event.setTag(request.getTag());
                event.setDescription(request.getDescription());
                event.setMessage(request.getMessage());
                event.setUpdatedAt(LocalDateTime.now().toString());

                csvAdapter.replaceAll(events);
                return event;
            }
        }

        throw new ApplicationException("DISPATCHER_NOT_FOUND", "Dispatcher event não encontrado para atualização. id=" + id);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            throw new ApplicationException("DISPATCHER_BLANK_ID", "O ID não pode ser vazio para exclusão.");
        }

        String idTrimmed = id.trim();
        List<DispatcherEventCsvRow> events = csvAdapter.findAll();
        boolean removed = events.removeIf(event -> idTrimmed.equals(event.getId()));

        if (!removed) {
            throw new ApplicationException("DISPATCHER_NOT_FOUND", "Dispatcher event não encontrado para exclusão. id=" + idTrimmed);
        }

        csvAdapter.replaceAll(events);
    }

    public List<DispatcherEventCsvRow> findByFilters(String productName, String targetMicroservice, String tag, String paymentNetwork, String messageType) {
        return csvAdapter.findAll().stream()
                .filter(event -> containsIgnoreCase(event.getProductName(), productName))
                .filter(event -> containsIgnoreCase(event.getTargetMicroservice(), targetMicroservice))
                .filter(event -> containsIgnoreCase(event.getTag(), tag))
                .filter(event -> containsIgnoreCase(event.getPaymentNetwork(), paymentNetwork))
                .filter(event -> containsIgnoreCase(event.getMessageType(), messageType))
                .toList();
    }

    private boolean containsIgnoreCase(String value, String filter) {
        if (filter == null || filter.isBlank()) {
            return true;
        }

        if (value == null) {
            return false;
        }

        return value.toLowerCase(Locale.ROOT).contains(filter.trim().toLowerCase(Locale.ROOT));
    }
}
