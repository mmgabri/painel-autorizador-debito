package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.DispatcherEventoCsvAdapter;
import br.com.mmgabri.domains.DispatcherEventoCsvRequest;
import br.com.mmgabri.domains.DispatcherEventoCsvRow;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class DispatcherEventoService {

    private final DispatcherEventoCsvAdapter csvAdapter;

    public DispatcherEventoService(DispatcherEventoCsvAdapter csvAdapter) {
        this.csvAdapter = csvAdapter;
    }

    public DispatcherEventoCsvRow save(DispatcherEventoCsvRequest request) {
        if (request.getId() != null && !request.getId().isBlank()) {
            return updateById(request);
        }

        DispatcherEventoCsvRow row = new DispatcherEventoCsvRow();
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

    private DispatcherEventoCsvRow updateById(DispatcherEventoCsvRequest request) {
        String id = request.getId().trim();
        List<DispatcherEventoCsvRow> eventos = csvAdapter.findAll();

        for (DispatcherEventoCsvRow evento : eventos) {
            if (id.equals(evento.getId())) {
                evento.setId(id);
                evento.setProductName(request.getProductName());
                evento.setTargetMicroservice(request.getTargetMicroservice());
                evento.setMessageModel(request.getMessageModel());
                evento.setMessageType(request.getMessageType());
                evento.setPaymentNetwork(request.getPaymentNetwork());
                evento.setTag(request.getTag());
                evento.setDescription(request.getDescription());
                evento.setMessage(request.getMessage());
                evento.setUpdatedAt(LocalDateTime.now().toString());

                csvAdapter.replaceAll(eventos);
                return evento;
            }
        }

        throw new IllegalArgumentException("Dispatcher event not found for update. id=" + id);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("ID cannot be blank for deletion.");
        }

        String idTrimmed = id.trim();
        List<DispatcherEventoCsvRow> eventos = csvAdapter.findAll();
        boolean removed = eventos.removeIf(evento -> idTrimmed.equals(evento.getId()));

        if (!removed) {
            throw new IllegalArgumentException("Dispatcher event not found for deletion. id=" + idTrimmed);
        }

        csvAdapter.replaceAll(eventos);
    }

    public List<DispatcherEventoCsvRow> findByFilters(String productName, String targetMicroservice, String tag, String paymentNetwork, String messageType) {
        return csvAdapter.findAll().stream()
                .filter(evento -> containsIgnoreCase(evento.getProductName(), productName))
                .filter(evento -> containsIgnoreCase(evento.getTargetMicroservice(), targetMicroservice))
                .filter(evento -> containsIgnoreCase(evento.getTag(), tag))
                .filter(evento -> containsIgnoreCase(evento.getPaymentNetwork(), paymentNetwork))
                .filter(evento -> containsIgnoreCase(evento.getMessageType(), messageType))
                .toList();
    }

    private boolean containsIgnoreCase(String value, String filtro) {
        if (filtro == null || filtro.isBlank()) {
            return true;
        }

        if (value == null) {
            return false;
        }

        return value.toLowerCase(Locale.ROOT).contains(filtro.trim().toLowerCase(Locale.ROOT));
    }
}
