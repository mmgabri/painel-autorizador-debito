package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.DispatcherEventCsvRow;

import java.util.List;

public interface DispatcherEventCsvAdapter {

    void append(DispatcherEventCsvRow event);

    void replaceAll(List<DispatcherEventCsvRow> events);

    List<DispatcherEventCsvRow> findAll();
}
